import React, { useEffect, useRef } from "react";

interface VideoThumbnailProps {
  src: string;
  currentTime: number;
  width?: number;
  height?: number;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  src,
  currentTime,
  width = 100,
  height = 56,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = currentTime;
  }, [currentTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      width={width}
      height={height}
      muted
      preload="metadata"
      className="object-cover rounded-md shadow-sm"
    />
  );
};
