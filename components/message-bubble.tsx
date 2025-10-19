import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProductCard, ProductCardProps } from "./product-card";
import { cn } from "@/lib/utils";
import { LoadingDots } from "./ui/loading-dots";

export interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;
}

interface ParsedMessage {
  text?: string;
  products?: ProductCardProps[];
}

function parseMessageContent(content: string): ParsedMessage {
  try {
    const parsed = JSON.parse(content);
    if (parsed.products && Array.isArray(parsed.products)) {
      return {
        text: parsed.text,
        products: parsed.products,
      };
    }
  } catch {
    // Not JSON, treat as plain text
  }
  return { text: content };
}

function MessageBubbleComponent({
  role,
  content,
  imageUrl,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const parsed = parseMessageContent(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-4 py-3 space-y-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {!content && !imageUrl ? (
          <LoadingDots />
        ) : (
          <>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="Uploaded image"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            {parsed.text && <p className="text-sm whitespace-pre-wrap">{parsed.text}</p>}
            {parsed.products && parsed.products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsed.products.map((product, idx) => (
                  <ProductCard key={idx} {...product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
