"use client";

import { useEffect } from "react";
import useStore from "@/features/editor/store/use-store";
import { VideoTrackItem } from "@/types";

const PREVIEW_WIDTH = 120;

export default function VideoThumbnailExtractor() {
  const { trackItemsMap, updateTrackItem } = useStore();

  useEffect(() => {
    const videoItem = Object.values(trackItemsMap).find(
      (i): i is VideoTrackItem =>
        i.type === "video" &&
        typeof i.src === "string" &&
        (!i.thumbnails || i.thumbnails.length === 0) &&
        !!i.trim
    );

    if (!videoItem || !videoItem.trim) return;

    const video = document.createElement("video");
    video.src = videoItem.src!;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const { start, end } = videoItem.trim!;
      const duration = end - start;

      if (duration <= 0) return;

      const count = Math.max(1, Math.floor(duration / 5));
      const step = duration / count;
      const times = Array.from({ length: count }, (_, i) => start + i * step);

      const canvas = document.createElement("canvas");
      canvas.width = PREVIEW_WIDTH;
      canvas.height = Math.floor((PREVIEW_WIDTH * 9) / 16);
      const ctx = canvas.getContext("2d")!;

      const thumbnails: { time: number; src: string }[] = [];
      let index = 0;

      const next = () => {
        if (index >= times.length) {
          updateTrackItem(videoItem.id, { thumbnails });
          return;
        }
        video.currentTime = times[index];
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnails.push({
          time: times[index],
          src: canvas.toDataURL("image/jpeg", 0.7),
        });
        index++;
        next();
      };

      next();
    };
  }, [trackItemsMap, updateTrackItem]);

  return null;
}
