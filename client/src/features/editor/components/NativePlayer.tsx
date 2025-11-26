"use client";

import React, { useRef, useEffect } from "react";

interface NativePlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (t: number) => void;
}

const NativePlayer: React.FC<NativePlayerProps> = ({ src, currentTime, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime, src]);

  const handleTimeUpdate = () => {
    if (videoRef.current) onTimeUpdate(videoRef.current.currentTime);
  };

  return <video ref={videoRef} src={src} controls className="w-full h-full object-contain" onTimeUpdate={handleTimeUpdate} />;
};

export default NativePlayer;
