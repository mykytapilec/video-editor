"use client";

import React, { useEffect, useRef } from "react";
import { useEditorStore } from "../store/use-editor-store";
import useStore from "../store/use-store";

export interface NativePlayerProps {
  src: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}

export default function NativePlayer({
  src,
  currentTime,
  onTimeUpdate,
}: NativePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // groups / selection — editor store
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);
  const groups = useEditorStore((s) => s.groups);

  // timeline store
  const setVideoDuration = useStore((s) => s.setVideoDuration);

  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      console.log("🎥 videoDuration =", state.videoDuration);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const handleLoadedMetadata = () => {
      if (Number.isFinite(el.duration)) {
        console.log("✅ loadedmetadata, duration =", el.duration);
        setVideoDuration(el.duration);
      }
    };

    el.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => el.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, [setVideoDuration]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (currentTime === undefined) return;

    if (Math.abs(el.currentTime - currentTime) > 0.05) {
      el.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const handleUpdate = () => {
      const group = groups.find((g) => g.id === selectedGroupId);

      if (group && el.currentTime >= group.end) {
        el.pause();
      }

      onTimeUpdate?.(el.currentTime);
    };

    el.addEventListener("timeupdate", handleUpdate);
    return () => el.removeEventListener("timeupdate", handleUpdate);
  }, [selectedGroupId, groups, onTimeUpdate]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return;

    el.currentTime = group.start;
    el.play();
  }, [selectedGroupId, groups]);

  return (
    <video
      ref={videoRef}
      src={src}
      className="max-h-full max-w-full"
      controls
      playsInline
    />
  );
}
