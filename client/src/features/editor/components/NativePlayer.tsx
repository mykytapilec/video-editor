"use client";

import React, { useRef, useEffect, useState } from "react";

interface NativePlayerProps {
  src: string | null;
  currentTime: number;
  onTimeUpdate: (t: number) => void;
  playbackRate?: number;
}

const NativePlayer: React.FC<NativePlayerProps> = ({
  src,
  currentTime,
  onTimeUpdate,
  playbackRate = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      setIsLoaded(true);
      video.currentTime = currentTime;
      video.play().catch(() => {});
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && isLoaded && Math.abs(video.currentTime - currentTime) > 0.1) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = playbackRate;
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) onTimeUpdate(video.currentTime);
  };

  if (!src) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
        No video source provided.
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full h-full object-contain"
      onTimeUpdate={handleTimeUpdate}
    />
  );
};

export default NativePlayer;
