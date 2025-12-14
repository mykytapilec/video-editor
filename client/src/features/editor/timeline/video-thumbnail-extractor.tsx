"use client";

import { useEffect } from "react";
import useStore from "@/features/editor/store/use-store";
import { TrackItem, VideoTrackItem, VideoThumbnail } from "@/types";

const PREVIEW_WIDTH = 120;

function isVideoItem(item: TrackItem): item is VideoTrackItem {
  return item.type === "video" && typeof item.src === "string";
}

export default function VideoThumbnailExtractor() {
  const { trackItemsMap, updateTrackItem } = useStore();

  useEffect(() => {
    const videoItem = Object.values(trackItemsMap).find(
      (item): item is VideoTrackItem =>
        isVideoItem(item) &&
        (!Array.isArray(item.thumbnails) || item.thumbnails.length === 0)
    );

    if (!videoItem) return;

    const trim = videoItem.trim ?? {
      start: 0,
      end: Math.max(1, videoItem.duration ?? 1),
    };

    const video = document.createElement("video");
    video.src = videoItem.src!;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = trim.end - trim.start;

      const count = Math.max(1, Math.floor(duration / 5));
      const step = duration / count;
      const times = Array.from(
        { length: count },
        (_, i) => trim.start + i * step
      );

      const canvas = document.createElement("canvas");
      canvas.width = PREVIEW_WIDTH;
      canvas.height = Math.floor((PREVIEW_WIDTH * 9) / 16);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const thumbnails: VideoThumbnail[] = [];
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
