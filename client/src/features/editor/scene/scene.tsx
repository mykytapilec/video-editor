"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import useTimelineStore from "../store/use-timeline-store";
import NativePlayer from "../components/NativePlayer";
import { useEditorStore } from "../store/use-editor-store";

export type SceneRef = { recalculateZoom: () => void };

const Scene = forwardRef<SceneRef>((_, ref) => {
  const currentVideoSrc = useEditorStore((s) => s.currentVideoSrc);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);

  useImperativeHandle(ref, () => ({
    recalculateZoom: () => {}
  }));

  return (
    <div className="w-full h-full relative bg-black min-h-[400px] flex items-center justify-center">
      {currentVideoSrc ? (
        <NativePlayer
          src={currentVideoSrc}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
        />
      ) : (
        <div className="text-white/60">Video preview / scene</div>
      )}
    </div>
  );
});

Scene.displayName = "Scene";

export default Scene;
