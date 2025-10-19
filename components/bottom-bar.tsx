import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MicrophoneSelector } from "./microphone-selector";
import { UserInput } from "./user-input";
import { AudioWaveform } from "./audio-waveform";
import { Spinner } from "@/components/ui/spinner";
import { Circle } from "lucide-react";

interface BottomBarProps {
  status: string;
  mediaStream: MediaStream | null;
  onStartSession: () => void;
  onDisconnect: () => void;
  onSendMessage: (text: string, imageUrl?: string) => void;
  selectedMicId: string | undefined;
  onMicChange: (deviceId: string) => void;
}

export function BottomBar({
  status,
  mediaStream,
  onStartSession,
  onDisconnect,
  onSendMessage,
  selectedMicId,
  onMicChange,
}: BottomBarProps) {
  // Disconnected state
  if (status === "disconnected") {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background border rounded-full shadow-2xl px-4 py-3 pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            <Button onClick={onStartSession} className="rounded-full px-6">
              <Circle className="size-3 fill-current" />
              Start Session
            </Button>
            <MicrophoneSelector
              selectedDeviceId={selectedMicId}
              onDeviceChange={onMicChange}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Connecting state
  if (status === "connecting") {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background border rounded-full shadow-2xl px-4 py-3 pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            <Button disabled className="rounded-full px-6">
              <Spinner className="mr-2" />
              Connecting...
            </Button>
            <Button variant="destructive" onClick={onDisconnect} className="rounded-full">
              ✕ Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Connected state (expanded with two rows)
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 px-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-background border rounded-3xl shadow-2xl p-4 space-y-3 pointer-events-auto"
      >
        {/* Row 1: Text Input */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <UserInput onSend={onSendMessage} />
          </motion.div>
        </AnimatePresence>

        {/* Row 2: Waveform + End Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 text-sm min-w-0">
            <AudioWaveform
              mediaStream={mediaStream}
              isActive={status === "connected"}
            />
          </div>
          <Button variant="destructive" onClick={onDisconnect} size="sm" className="rounded-full shrink-0">
            ✕ End Session
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
