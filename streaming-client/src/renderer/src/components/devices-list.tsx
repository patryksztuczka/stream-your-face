import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

const DevicesList = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideoDevices = async () => {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === "videoinput"
    );
  };

  const getUserMediaStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        frameRate: 30,
      },
      audio: false,
    });

    if (!videoRef.current) return;

    console.log("debug");

    videoRef.current.srcObject = mediaStream;
    videoRef.current.play();

    return mediaStream;
  };

  const { data } = useQuery({
    queryKey: ["mediaDevices"],
    queryFn: getVideoDevices,
  });

  const query = useQuery({
    queryKey: ["userMediaStream"],
    queryFn: getUserMediaStream,
  });

  return (
    <div className="">
      {data?.map((device) => (
        <div>{device.label}</div>
      ))}
      <div className="bg-gray-100">
        <span>stream</span>
        <video ref={videoRef} />
      </div>
    </div>
  );
};

export default DevicesList;
