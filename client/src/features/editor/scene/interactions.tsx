"use client";

import React from "react";
import useTimelineStore from "../store/use-timeline-store";

export function SceneInteractions() {
  const { playerRef } = useTimelineStore((s) => ({
    playerRef: s.playerRef,
  }));

  return null;
}
