import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { Message } from "@/hooks/use-realtime-agent";
import { Card } from "./ui/card";
import { Spinner } from "./ui/spinner";
import { Headphones, ShoppingBag, Laptop } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  status: string;
}

export function MessageList({ messages, status }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show loading spinner when connecting
  if (status === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="max-w-md text-center space-y-4">
          <Spinner className="size-12 mx-auto" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Connecting to assistant...</p>
            <p className="text-xs text-muted-foreground">
              Requesting microphone access...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen when no messages
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center space-y-8">
          <div className="text-7xl">🛍️</div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">Commerce Assistant</h1>
            <p className="text-lg text-muted-foreground">
              Voice Shopping Assistant
            </p>
            <p className="text-sm text-muted-foreground">
              Start a conversation to find products
            </p>
          </div>
          <Card className="px-12 py-6 space-y-2 text-left">
            <p className="text-sm font-medium text-center">Try asking:</p>
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <Headphones className="size-5 shrink-0" />
              <p className="text-sm">&quot;Show me wireless headphones&quot;</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="size-5 shrink-0" />
              <p className="text-sm">&quot;Find red sneakers under $50&quot;</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <Laptop className="size-5 shrink-0" />
              <p className="text-sm">&quot;I need a laptop for gaming&quot;</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show messages
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
