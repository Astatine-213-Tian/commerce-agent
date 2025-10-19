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

// ============================================================================
// Types & Exports
// ============================================================================

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;
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

// ============================================================================
// Main Hook
// ============================================================================

export default function useRealtimeAgent({
  onDisconnect,
}: UseRealtimeAgentProps): UseRealtimeAgentReturn {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const messagesRef = useRef<Message[]>([]);
  const sessionRef = useRef<RealtimeSession | null>(null);

  // Sync messages to ref for disconnect callback
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // --------------------------------------------------------------------------
  // Convex Hooks
  // --------------------------------------------------------------------------
  const searchByText = useAction(api.product.actions.searchProductsByText);
  const searchByImage = useAction(api.product.actions.searchProductsByImage);
  const listCategories = useQuery(api.category.queries.listCategories);

  // --------------------------------------------------------------------------
  // Memoized Values
  // --------------------------------------------------------------------------
  const tools = useMemo(
    () => createAgentTools(searchByText, searchByImage, () => Promise.resolve(listCategories || [])),
    [searchByText, searchByImage, listCategories]
  );

  const agent = useMemo(
    () =>
      new RealtimeAgent({
        name: AGENT_CONFIG.name,
        instructions: AGENT_CONFIG.instructions,
        tools,
      }),
    [tools]
  );

  // --------------------------------------------------------------------------
  // Message Update Utility
  // --------------------------------------------------------------------------
  const updateMessageById = useCallback((messageId: string, updater: (msg: Message) => Message) => {
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === messageId);
      if (index < 0) return prev;

      const updated = [...prev];
      updated[index] = updater(updated[index]);
      return updated;
    });
  }, []);

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------
  const handleInputAudioTranscription = useCallback(
    (event: { item_id: string; transcript: string }) => {
      console.log("[EVENT] input_audio_transcription.completed:", event);
      updateMessageById(event.item_id, (msg) => ({
        ...msg,
        content: event.transcript,
      }));
    },
    [updateMessageById]
  );

  const handleOutputAudioTranscription = useCallback(
    (event: { item_id: string; delta: string }) => {
      // console.log("[EVENT] response.output_audio_transcript.delta:", event);
      updateMessageById(event.item_id, (msg) => ({
        ...msg,
        content: (msg.content || "") + event.delta,
      }));
    },
    [updateMessageById]
  );

  const handleHistoryAdded = useCallback((item: RealtimeItem) => {
    console.log("[EVENT] history_added:", item);
    if (item.type !== "message") return;

    const messageItem = item as RealtimeMessageItem;
    const extracted = extractMessageContent(messageItem);

    const newMessage: Message = {
      id: messageItem.itemId || Date.now().toString(),
      role: messageItem.role,
      content: extracted?.content || "",
      imageUrl: extracted?.imageUrl,
    };

    setMessages((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === newMessage.id);
      if (existingIndex >= 0) return prev; // Don't overwrite existing
      return [...prev, newMessage];
    });
  }, []);

  const handleSessionError = useCallback((error: unknown) => {
    console.error("Session error:", error);
    setStatus(ConnectionStatus.Error);
  }, []);

  // --------------------------------------------------------------------------
  // Session Setup Helpers
  // --------------------------------------------------------------------------
  /**
   * Fetches an ephemeral token from the API
   */
  const getEphemeralToken = useCallback(async (): Promise<string> => {
    const response = await fetch("/api/ephemeral-token", { method: "POST" });

    if (!response.ok) {
      throw new Error(`Failed to get ephemeral token: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
  }, []);

  /**
   * Sets up the microphone media stream
   */
  const setupMediaStream = useCallback(async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream);
    return stream;
  }, []);

  /**
   * Creates and configures a RealtimeSession
   */
  const createRealtimeSession = useCallback(
    (stream: MediaStream): RealtimeSession => {
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;

      const transport = new OpenAIRealtimeWebRTC({
        mediaStream: stream,
        audioElement,
      });

      const session = new RealtimeSession(agent, {
        model: AGENT_CONFIG.model,
        transport,
        config: {
          inputAudioTranscription: {
            model: AGENT_CONFIG.transcription.model,
          },
        },
      });

      return session;
    },
    [agent]
  );

  /**
   * Attaches all event listeners to the session
   */
  const setupSessionEventListeners = useCallback(
    (session: RealtimeSession) => {
      // User speech transcription
      session.transport.on(
        "conversation.item.input_audio_transcription.completed",
        handleInputAudioTranscription
      );

      // Assistant speech transcription (streaming)
      session.transport.on(
        "response.output_audio_transcript.delta",
        handleOutputAudioTranscription
      );

      // New messages added to history
      session.on("history_added", handleHistoryAdded);

      // Session errors
      session.on("error", handleSessionError);
    },
    [
      handleInputAudioTranscription,
      handleOutputAudioTranscription,
      handleHistoryAdded,
      handleSessionError,
    ]
  );

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------
  /**
   * Connects to the OpenAI Realtime API
   */
  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionStatus.Connecting);

      const token = await getEphemeralToken();
      const stream = await setupMediaStream();
      const session = createRealtimeSession(stream);

      setupSessionEventListeners(session);
      sessionRef.current = session;

      await session.connect({ apiKey: token });

      setStatus(ConnectionStatus.Connected);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
      setStatus(ConnectionStatus.Error);
      setIsConnected(false);
    }
  }, [getEphemeralToken, setupMediaStream, createRealtimeSession, setupSessionEventListeners]);

  /**
   * Disconnects from the session and cleans up resources
   */
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

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
   * Sends a text message with optional image URL
   */
  const sendMessage = useCallback((text: string, imageUrl?: string) => {
    if (!sessionRef.current) {
      console.error("No active session");
      return;
    }

    if (imageUrl) {
      const message = text
        ? `${text} [Image URL: ${imageUrl}]`
        : `Search for products similar to this image. [Image URL: ${imageUrl}]`;
      sessionRef.current.sendMessage(message);
    } else {
      sessionRef.current.sendMessage(text);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      console.log("[DEBUG] cleanup on unmount");
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts content and imageUrl from a RealtimeMessageItem
 */
function extractMessageContent(messageItem: RealtimeMessageItem): {
  content: string;
  imageUrl?: string;
} | null {
  let content = "";

  if (Array.isArray(messageItem.content)) {
    for (const contentItem of messageItem.content) {
      if (contentItem.type === "input_audio") {
        content = contentItem.transcript || "";
        break;
      } else if (contentItem.type === "output_audio") {
        content = contentItem.transcript || "";
        break;
      } else if (contentItem.type === "input_text") {
        content = contentItem.text || "";
        break;
      } else if (contentItem.type === "output_text") {
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
    content = content.replace(imageUrlMatch[0], "").trim();
  }

  return { content, imageUrl };
}
