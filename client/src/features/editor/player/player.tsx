"use client";

import React, { useEffect, useRef } from "react";
import Composition from "./composition";
import { Player as RemotionPlayer, PlayerRef } from "@remotion/player";
import useStore from "../store/use-store";

const Player: React.FC = () => {
  const playerRef = useRef<PlayerRef | null>(null);
  const { setPlayerRef, duration, fps, size, background } = useStore((s) => ({
    setPlayerRef: s.setPlayerRef,
    duration: s.duration,
    fps: s.fps,
    size: s.size,
    background: s.background,
  }));

  useEffect(() => {
    setPlayerRef(playerRef as React.RefObject<PlayerRef>);
    return () => setPlayerRef(null);
  }, [setPlayerRef]);

  return (
    <div className="w-full h-full">
      <RemotionPlayer
        ref={playerRef as any}
        component={Composition as any}
        durationInFrames={Math.max(1, Math.round((duration / 1000) * fps))}
        compositionWidth={size.width}
        compositionHeight={size.height}
        fps={fps}
        style={{ width: "100%", height: "100%" }}
        autoPlay={false}
      />
    </div>
  );
};

export default Player;
