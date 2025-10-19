"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";

interface AudioWaveformProps {
  mediaStream: MediaStream | null;
  isActive: boolean;
}

export function AudioWaveform({ mediaStream, isActive }: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const recordPluginRef = useRef<RecordPlugin | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "hsl(var(--primary))",
      progressColor: "hsl(var(--primary))",
      cursorColor: "transparent",
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      barHeight: 1,
      height: 32,
      hideScrollbar: true,
    });

    // Create Record plugin
    const record = RecordPlugin.create({
      scrollingWaveform: true,
      scrollingWaveformWindow: 6,
      renderRecordedAudio: false,
    });

    wavesurfer.registerPlugin(record);

    wavesurferRef.current = wavesurfer;
    recordPluginRef.current = record;

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!recordPluginRef.current || !mediaStream || !isActive) {
      return;
    }

    // Render the media stream
    const micStream = recordPluginRef.current.renderMicStream(mediaStream);

    return () => {
      // Stop rendering when inactive or stream changes
      micStream.onDestroy();
    };
  }, [mediaStream, isActive]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-w-0"
      style={{ opacity: isActive ? 1 : 0.5 }}
    />
  );
}
