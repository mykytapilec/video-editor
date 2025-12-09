// client/src/features/editor/components/NativePlayer.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import useStore from "../store/use-store";

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

  const setVideoDuration = useStore((s) => s.setVideoDuration);
  const setPlayerRef = useStore((s) => s.setPlayerRef);

  useEffect(() => {
    // register videoRef in store so Timeline (and others) can control it
    setPlayerRef(videoRef);
    return () => {
      // cleanup
      setPlayerRef(null);
    };
  }, [setPlayerRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      // store duration (seconds)
      setVideoDuration(video.duration || 0);
      setIsLoaded(true);
      // keep player roughly at currentTime
      try {
        video.currentTime = currentTime;
      } catch {}
      video.play().catch(() => {});
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
    // note: we intentionally do NOT include currentTime in deps to avoid re-attaching
  }, [src, setVideoDuration]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && isLoaded && Math.abs(video.currentTime - currentTime) > 0.1) {
      try {
        video.currentTime = currentTime;
      } catch {}
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
