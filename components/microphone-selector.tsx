import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic } from "lucide-react";

interface MicrophoneSelectorProps {
  selectedDeviceId: string | undefined;
  onDeviceChange: (deviceId: string) => void;
}

export function MicrophoneSelector({
  selectedDeviceId,
  onDeviceChange,
}: MicrophoneSelectorProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function getDevices() {
      try {
        // Request microphone permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = deviceList.filter(
          (device) => device.kind === "audioinput"
        );
        setDevices(audioInputs);
        // Auto-select default device if not already selected
        if (!selectedDeviceId && audioInputs.length > 0) {
          const defaultDevice =
            audioInputs.find((d) => d.deviceId === "default") ||
            audioInputs[0];
          onDeviceChange(defaultDevice.deviceId);
        }
      } catch (error) {
        console.error("Failed to enumerate devices:", error);
      }
    }

    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, [selectedDeviceId, onDeviceChange]);

  return (
    <Select value={selectedDeviceId} onValueChange={onDeviceChange}>
      <SelectTrigger className="w-[240px] rounded-full">
        <Mic className="size-4" />
        <SelectValue placeholder="Select Microphone" />
      </SelectTrigger>
      <SelectContent>
        {devices
          .filter((device) => device.deviceId) // Filter out devices with empty IDs
          .map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
