"use client";

import React, { useEffect } from "react";
import useStore from "../store/use-store";

export function SceneInteractions() {
  const { playerRef, setState } = useStore((s) => ({
    playerRef: s.playerRef,
    trackItemsMap: s.trackItemsMap,
    setState: s.setState,
  }));
  const trackItemsMap = useStore((s) => s.trackItemsMap);

  useEffect(() => {
    const onSeeked = (ev: any) => {
      try {
        const fps = useStore.getState().fps || 30;
        const frame = ev?.detail?.frame ?? 0;
        const timeMs = (frame / fps) * 1000;
        let visibleId: string = '';

        if ((trackItemsMap?.start || 0) * 1000 <= timeMs && trackItemsMap?.end || (trackItemsMap?.duration || 0) * 1000 >= timeMs) {
          visibleId = trackItemsMap?.id || '';
        }

        setState({ activeId: visibleId });
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
