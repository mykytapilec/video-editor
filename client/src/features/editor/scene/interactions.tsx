"use client";

import React, { useEffect } from "react";
import useStore from "../store/use-store";

export function SceneInteractions() {
  const { playerRef, setState } = useStore((s) => ({
    playerRef: s.playerRef,
    trackItemsMap: s.trackItemsMap,
    setState: s.setState,
  }));

  useEffect(() => {
    const onSeeked = (ev: any) => {
      try {
        const fps = useStore.getState().fps || 30;
        const frame = ev?.detail?.frame ?? 0;
        const timeMs = (frame / fps) * 1000;
        const visibleIds: number[] = [];

        const map = useStore.getState().trackItemsMap;
        for (const key of Object.keys(map)) {
          const numKey = Number(key);
          const it = map[numKey];
          if (!it) continue;
          if (it.start * 1000 <= timeMs && it.end * 1000 >= timeMs) {
            visibleIds.push(numKey);
          }
        }
        setState({ activeIds: visibleIds });
      } catch (e) {
        // ignore errors (defensive)
      }
    };

    playerRef?.current?.addEventListener && playerRef?.current?.addEventListener("seeked", onSeeked);
    return () => {
      playerRef?.current?.removeEventListener && playerRef?.current?.removeEventListener("seeked", onSeeked);
    };
  }, [playerRef, setState]);

  return null;
}
