"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  RealtimeAgent,
  RealtimeSession,
  RealtimeItem,
  RealtimeMessageItem,
  OpenAIRealtimeWebRTC,
} from "@openai/agents/realtime";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createAgentTools, AGENT_CONFIG } from "@/lib/agent-config";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;  // Single Convex storage URL for display and processing
}

export enum ConnectionStatus {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Error = "error",
}

interface UseRealtimeAgentProps {
  onDisconnect?: (messages: Message[]) => void;
}

interface UseRealtimeAgentReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  messages: Message[];
  mediaStream: MediaStream | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (text: string, imageUrl?: string) => void;
}

export default function useRealtimeAgent({ onDisconnect }: UseRealtimeAgentProps): UseRealtimeAgentReturn {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const sessionRef = useRef<RealtimeSession | null>(null);

  // Convex action hooks
  const searchByText = useAction(api.product.actions.searchProductsByText);
  const searchByImage = useAction(api.product.actions.searchProductsByImage);
  const listCategories = useQuery(api.category.queries.listCategories);

  // Memoize tools to avoid recreating on every render
  const tools = useMemo(
    () => createAgentTools(searchByText, searchByImage, () => Promise.resolve(listCategories || [])),
    [searchByText, searchByImage, listCategories]
  );

  // Memoize agent to avoid recreating on every connect
  const agent = useMemo(
    () =>
      new RealtimeAgent({
        name: AGENT_CONFIG.name,
        instructions: AGENT_CONFIG.instructions,
        tools,
      }),
    [tools]
  );

  /**
   * Connect to the realtime session
   */
  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionStatus.Connecting);

      // Get ephemeral token
      const response = await fetch("/api/ephemeral-token", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to get ephemeral token: ${response.status}`);
      }

      const data = await response.json();
      const ephemeralKey = data.value;

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      // Create custom WebRTC transport with our mediaStream
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      const transport = new OpenAIRealtimeWebRTC({
        mediaStream: stream,
        audioElement,
      });

      // Create session with transcription enabled
      const session = new RealtimeSession(agent, {
        model: AGENT_CONFIG.model,
        transport,
        config: {
          inputAudioTranscription: {
            model: AGENT_CONFIG.transcription.model,
          },
        },
      });

      sessionRef.current = session;

      // Listen for input audio transcription (user speech)
      session.transport.on(
        "conversation.item.input_audio_transcription.completed",
        (event) => {
          console.log("[EVENT] input_audio_transcription.completed:", event);
          setMessages((prev) => {
            const messageIndex = prev.findIndex((m) => m.id === event.item_id);
            if (messageIndex >= 0) {
              const updated = [...prev];
              updated[messageIndex] = {
                ...updated[messageIndex],
                content: event.transcript,
              };
              return updated;
            }
            return prev;
          });
        }
      );

      // Listen for response audio transcription (assistant speech)
      session.transport.on(
        "response.output_audio_transcript.delta",
        (event) => {
          console.log("[EVENT] response.output_audio_transcript.delta:", event);
          setMessages((prev) => {
            const messageIndex = prev.findIndex((m) => m.id === event.item_id);
            if (messageIndex >= 0) {
              const updated = [...prev];
              updated[messageIndex] = {
                ...updated[messageIndex],
                content: (updated[messageIndex].content || "") + event.delta,
              };
              return updated;
            }
            return prev;
          });
        }
      );


      // Listen for history updates to create message placeholders
      session.on("history_added", (item: RealtimeItem) => {
        console.log("[EVENT] history_added:", item);
        if (item.type !== "message") return;

        const messageItem = item as RealtimeMessageItem;
        const extracted = extractMessageContent(messageItem);

        // Create message with content if available (e.g., text messages)
        // Audio messages will be updated later by transcription events
        const newMessage: Message = {
          id: messageItem.itemId || Date.now().toString(),
          role: messageItem.role,
          content: extracted?.content || "",
          imageUrl: extracted?.imageUrl,
        };

        setMessages((prev) => {
          // Update existing message if it exists, otherwise add new
          const existingIndex = prev.findIndex((m) => m.id === newMessage.id);
          if (existingIndex >= 0) {
            return prev; // Don't overwrite existing messages
          }
          return [...prev, newMessage];
        });
      });

      session.on("error", (errorEvent) => {
        console.error("Session error:", errorEvent.error);
        setStatus(ConnectionStatus.Error);
      });

      // Connect to OpenAI (WebRTC auto-configures mic and speaker)
      await session.connect({ apiKey: ephemeralKey });

      setStatus(ConnectionStatus.Connected);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
      setStatus(ConnectionStatus.Error);
      setIsConnected(false);
    }
  }, [agent]);

  /**
   * Disconnect from the session
   */
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    // Stop microphone tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }

    const snapshotMessages = messagesRef.current;
    setStatus(ConnectionStatus.Disconnected);
    setIsConnected(false);
    setMessages([]);

    if (onDisconnect && snapshotMessages.length > 0) {
      onDisconnect(snapshotMessages);
    }
  }, [onDisconnect, mediaStream]);

  /**
   * Send a message with optional image
   */
  const sendMessage = useCallback((text: string, imageUrl?: string) => {
    if (!sessionRef.current) {
      console.error("No active session");
      return;
    }

    if (imageUrl) {
      // Send plain text with image URL, agent will extract it
      const message = text
        ? `${text} [Image URL: ${imageUrl}]`
        : `Search for products similar to this image. [Image URL: ${imageUrl}]`;
      sessionRef.current.sendMessage(message);
    } else {
      // Send regular text message
      sessionRef.current.sendMessage(text);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("[DEBUG] cleanup on unmount");
      disconnect();
    };
  }, []);

  return {
    status,
    isConnected,
    messages,
    mediaStream,
    connect,
    disconnect,
    sendMessage,
  };
}

/**
 * Extract content from a RealtimeMessageItem
 */
function extractMessageContent(messageItem: RealtimeMessageItem): {
  content: string;
  imageUrl?: string;
} | null {
  let content = "";

  if (Array.isArray(messageItem.content)) {
    for (const contentItem of messageItem.content) {
      if (contentItem.type === "input_audio") {
        // User speech transcription
        content = contentItem.transcript || "";
        break;
      } else if (contentItem.type === "output_audio") {
        // Assistant speech transcription
        content = contentItem.transcript || "";
        break;
      } else if (contentItem.type === "input_text") {
        // User text input
        content = contentItem.text || "";
        break;
      } else if (contentItem.type === "output_text") {
        // Assistant text output
        content = contentItem.text || "";
        break;
      }
    }
  }

  if (!content) return null;

  // Extract image URL if present (format: [Image URL: ...])
  let imageUrl: string | undefined;
  const imageUrlMatch = content.match(/\[Image URL: (https:\/\/[^\]]+)\]/);
  if (imageUrlMatch) {
    imageUrl = imageUrlMatch[1];
    // Remove the [Image URL: ...] tag from content
    content = content.replace(imageUrlMatch[0], "").trim();
  }

  return { content, imageUrl };
}