import { useState, KeyboardEvent, useRef, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowUp, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface UserInputProps {
  onSend: (text: string, imageUrl?: string) => void;
  disabled?: boolean;
}

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export function UserInput({ onSend, disabled }: UserInputProps) {
  const [value, setValue] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingStorageId, setPendingStorageId] = useState<Id<"_storage"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.storage.mutations.generateUploadUrl);

  // Fetch URL for pending storage ID
  const imageUrl = useQuery(
    api.storage.queries.getImageUrl,
    pendingStorageId ? { storageId: pendingStorageId } : "skip"
  );

  // When URL is loaded, set it to uploaded state
  useEffect(() => {
    if (imageUrl) {
      setUploadedImageUrl(imageUrl);
      setPendingStorageId(null);
      setIsUploading(false);
    }
  }, [imageUrl]);

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // Only take the first file

    // Validate file type
    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      toast.error("Only PNG and JPG/JPEG images are supported");
      return;
    }

    setIsUploading(true);

    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await response.json();
      setPendingStorageId(storageId as Id<"_storage">);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
  };

  const handleSend = () => {
    const trimmed = value.trim();

    if (trimmed || uploadedImageUrl) {
      onSend(trimmed, uploadedImageUrl || undefined);
      setValue("");
      setUploadedImageUrl(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !disabled && !isUploading && (value.trim() || uploadedImageUrl);

  return (
    <div className="w-full space-y-2">
      {/* Image upload area - always visible */}
      <div className="flex gap-2 pb-2">
        {isUploading ? (
          <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
            <Spinner />
          </div>
        ) : uploadedImageUrl ? (
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={uploadedImageUrl}
              alt="Upload preview"
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full p-1 hover:bg-secondary/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="w-16 h-16 flex-shrink-0 bg-muted hover:bg-muted/80 rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-2 w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_MIME_TYPES.join(",")}
          onChange={(e) => handleImageSelect(e.target.files)}
          className="hidden"
        />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled || isUploading}
          className="flex-1 rounded-full"
        />
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="rounded-full flex-shrink-0"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
