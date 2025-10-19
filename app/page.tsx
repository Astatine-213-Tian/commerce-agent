"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import useRealtimeAgent, { Message } from "@/hooks/use-realtime-agent";
import { MessageList, PreviousSessions } from "@/components/message-list";
import { BottomBar } from "@/components/bottom-bar";
import { WelcomeScreen } from "@/components/welcome-screen";

export default function Home() {
  const [selectedMicId, setSelectedMicId] = useState<string | undefined>();
  const [prevSessions, setPrevSessions] = useState<Message[][]>([]);

  const handleDisconnect = useCallback((messages: Message[]) => {
    setPrevSessions((prev) => [...prev, messages]);
  }, []);

  const {
    status,
    messages,
    mediaStream,
    connect,
    disconnect,
    sendText,
  } = useRealtimeAgent({
    onDisconnect: handleDisconnect,
  });

  // Handle error status
  useEffect(() => {
    if (status === "error") {
      toast.error("Connection failed. Please try again.");
      disconnect();
    }
  }, [status, disconnect]);

  const handleStartSession = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error("Failed to connect. Please check your microphone permissions.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        {/* Show welcome screen when no messages at all */}
        {prevSessions.length === 0 && messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <>
            {/* Render previous sessions with separators */}
            <PreviousSessions sessions={prevSessions} />
            {/* Render current session */}
            <MessageList messages={messages} />
          </>
        )}
      </div>
      <BottomBar
        status={status}
        mediaStream={mediaStream}
        onStartSession={handleStartSession}
        onDisconnect={disconnect}
        onSendText={sendText}
        selectedMicId={selectedMicId}
        onMicChange={setSelectedMicId}
      />
      <Toaster />
    </div>
  );
}
