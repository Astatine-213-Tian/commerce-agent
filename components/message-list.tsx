import { useEffect, useRef, memo } from "react";
import { MessageBubble } from "./message-bubble";
import { Message } from "@/hooks/use-realtime-agent";
import { Circle } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  autoScroll?: boolean;
}

export function MessageList({ messages, autoScroll = true }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            imageUrl={message.imageUrl}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// Memoized component for previous sessions to prevent re-renders
export const PreviousSessions = memo(({ sessions }: { sessions: Message[][] }) => (
  <>
    {sessions.map((session, index) => (
      <div key={index}>
        <MessageList messages={session} autoScroll={false} />
        <div className="relative flex items-center justify-center py-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex items-center gap-2 px-4 bg-background text-xs text-muted-foreground">
            <Circle className="size-2 fill-muted-foreground" />
            Session ended
            <Circle className="size-2 fill-muted-foreground" />
          </div>
        </div>
      </div>
    ))}
  </>
));
PreviousSessions.displayName = "PreviousSessions";
