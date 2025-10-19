"use client";

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import useRealtimeAgent from "@/hooks/use-realtime-agent";
import { MessageList } from "@/components/message-list";
import { BottomBar } from "@/components/bottom-bar";

export default function Home() {
  const {
    status,
    messages,
    mediaStream,
    connect,
    disconnect,
    sendText,
  } = useRealtimeAgent();

  const [selectedMicId, setSelectedMicId] = useState<string | undefined>();

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

  const handleEndSession = () => {
    disconnect();
  };

  const handleCancelConnection = () => {
    disconnect();
  };

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} status={status} />
      <BottomBar
        status={status}
        mediaStream={mediaStream}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
        onCancelConnection={handleCancelConnection}
        onSendText={sendText}
        selectedMicId={selectedMicId}
        onMicChange={setSelectedMicId}
      />
      <Toaster />
    </div>
  );
}
