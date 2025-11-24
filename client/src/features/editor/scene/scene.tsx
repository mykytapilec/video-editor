"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import useStore from "../store/use-store";
import NativePlayer from "../components/NativePlayer";

export type SceneRef = { recalculateZoom: () => void };

const Scene = forwardRef<SceneRef>((props, ref) => {
  const currentVideoSrc = useStore((s) => s.currentVideoSrc);
  const currentTime = useStore((s) => s.currentTime);
  const setCurrentTime = useStore((s) => s.setCurrentTime);

  useImperativeHandle(ref, () => ({
    recalculateZoom: () => {
      // TODO: implement if needed
    }
  }));

  return (
    <div className="w-full h-full relative bg-black min-h-[400px] flex items-center justify-center">
      {currentVideoSrc ? (
        <NativePlayer src={currentVideoSrc} currentTime={currentTime} onTimeUpdate={setCurrentTime} />
      ) : (
        <div className="text-white/60">Video preview / scene</div>
      )}
    </div>
  );
});

Scene.displayName = "Scene";

export default Scene;
