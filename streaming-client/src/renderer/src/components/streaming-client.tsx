import { useState, useRef, useEffect } from "react";
import { Play, Square, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { type SourceType } from "../types/source";
import { sources } from "../utils/constants";
import { SourceCard } from "./source-card";
import { CameraSelector } from "./camera-selector";

export default function StreamingClient() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentSource, setCurrentSource] = useState<SourceType>("camera");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Fetch video devices to set the initial device
  const { data: videoDevices } = useQuery({
    queryKey: ["mediaDevices"],
    queryFn: async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "videoinput");
    },
  });

  // Set first device as default
  useEffect(() => {
    if (videoDevices && videoDevices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [videoDevices]);

  // Handle video stream
  const handleStream = async (type: SourceType) => {
    try {
      let stream;

      if (type === "camera" && selectedDeviceId) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId,
            frameRate: 30,
          },
          audio: false,
        });
      } else if (type === "screen" || type === "window") {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setIsStreaming(false);
    }
  };

  // Stop current stream
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  // Handle source change
  const handleSourceChange = async (type: SourceType) => {
    stopStream();
    setCurrentSource(type);
    if (isStreaming) {
      await handleStream(type);
    }
  };

  // Handle device change
  const handleDeviceChange = async (deviceId: string) => {
    stopStream();
    setSelectedDeviceId(deviceId);
    if (isStreaming && currentSource === "camera") {
      await handleStream("camera");
    }
  };

  // Handle Start/Stop button
  const toggleStreaming = async () => {
    if (isStreaming) {
      stopStream();
    } else {
      await handleStream(currentSource);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 h-16 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
            StreamCraft
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {currentSource === "camera" && (
            <CameraSelector
              selectedDeviceId={selectedDeviceId}
              onDeviceChange={handleDeviceChange}
            />
          )}
          <button className="p-2 rounded-full hover:bg-white/10 transition">
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={toggleStreaming}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-medium
              transition duration-200
              ${
                isStreaming
                  ? "bg-red-500/80 hover:bg-red-500"
                  : "bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-90"
              }
            `}
          >
            {isStreaming ? (
              <>
                <Square className="w-4 h-4" /> Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row pt-16 pb-20 md:pb-0 min-h-screen">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col gap-3 p-4 w-64 bg-black/40 backdrop-blur-sm border-r border-white/10">
          <h2 className="text-sm font-medium text-gray-400 mb-2 px-2">
            Sources
          </h2>
          {sources.map((source) => (
            <SourceCard
              key={source.type}
              source={source}
              isActive={currentSource === source.type}
              onSelect={() => handleSourceChange(source.type)}
            />
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
          {/* Preview */}
          <div className="relative w-full max-w-4xl aspect-video mb-6">
            <motion.div
              className="absolute inset-0 rounded-2xl shadow-2xl ring-1 ring-white/20 overflow-hidden backdrop-blur"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              key={currentSource}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Stream indicator */}
              {isStreaming && (
                <motion.div
                  className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-medium">LIVE</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around p-3 bg-black/40 backdrop-blur-sm border-t border-white/10">
        {sources.map((source) => {
          const Icon = source.icon;
          const isActive = currentSource === source.type;

          return (
            <button
              key={source.type}
              onClick={() => handleSourceChange(source.type)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg
                ${isActive ? "text-sky-400" : "text-gray-400"}
              `}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{source.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
