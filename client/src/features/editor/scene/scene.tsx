"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import StateManager from "@designcombo/state";
import NativePlayer from "../components/NativePlayer";
import useStore from "../store/use-store";

export type SceneRef = {
  recalculateZoom: () => void;
};

type Props = {
  stateManager: StateManager;
};

const Scene = forwardRef<SceneRef, Props>(({ stateManager }, ref) => {
  const localRef = useRef<HTMLDivElement | null>(null);

  const currentVideoSrc = useStore((s) => s.currentVideoSrc);
  const setCurrentTime = useStore((s) => s.setCurrentTime);
  const currentTime = useStore((s) => s.currentTime);

  useImperativeHandle(ref, () => ({
    recalculateZoom: () => {
      // todo: implement zoom recalculation logic if needed
    },
  }));

  return (
    <div
      ref={localRef}
      className="w-full h-full relative bg-black"
      style={{ minHeight: 400 }}
    >
      {currentVideoSrc ? (
        <NativePlayer
          src={currentVideoSrc}
          currentTime={currentTime}
          onTimeUpdate={(t: number) => setCurrentTime(t)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
          Video preview / scene
        </div>
      )}
    </div>
  );
});

Scene.displayName = "Scene";

export default Scene;
