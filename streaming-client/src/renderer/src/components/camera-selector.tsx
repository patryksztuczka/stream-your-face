import { useQuery } from "@tanstack/react-query";

interface CameraSelectorProps {
  selectedDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
}

export const CameraSelector = ({
  selectedDeviceId,
  onDeviceChange,
}: CameraSelectorProps) => {
  // Query available video devices
  const { data: videoDevices } = useQuery({
    queryKey: ["mediaDevices"],
    queryFn: async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput"
      );
      console.log("Available video devices:", videoInputs);
      return videoInputs;
    },
  });

  if (!videoDevices || videoDevices.length === 0) {
    return null;
  }

  return (
    <select
      value={selectedDeviceId}
      onChange={(e) => onDeviceChange(e.target.value)}
      className="bg-black/40 text-white text-sm rounded-lg px-3 py-1.5 border border-white/10"
    >
      {videoDevices.map((device) => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
        </option>
      ))}
    </select>
  );
};
