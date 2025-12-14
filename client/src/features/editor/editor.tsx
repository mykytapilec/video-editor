"use client";

import React, { useEffect, useRef, useState } from "react";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import Scene from "./scene/scene";
import StateManager from "@designcombo/state";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item/menu-item";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import FloatingControl from "./control-item/floating-controls/floating-control";
import CropModal from "./crop-modal/crop-modal";
import MenuListHorizontal from "./menu-list-horizontal";
import ControlItemHorizontal from "./control-item-horizontal";
import { ControlItem } from "./control-item";
import useLayoutStore from "./store/use-layout-store";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { TrackItem } from "@/types";
import { convertToITrackItem } from "@/utils/convertToITrackItem";
import Timeline from "./timeline/timeline";
import { SceneRef } from "./scene/scene.types";
import { useEditorStore } from "./store/use-editor-store";

const stateManager = new StateManager({
  size: { width: 1080, height: 1920 },
});

const Editor: React.FC = () => {
  const [projectName, setProjectName] = useState("Untitled video");

  const sceneRef = useRef<SceneRef>(null);

  const activeIds = useStore((s) => s.activeIds);
  const trackItemsMap = useStore((s) => s.trackItemsMap);
  const updateTrackItem = useStore((s) => s.updateTrackItem);

  const [trackItem, setTrackItem] = useState<TrackItem | null>(null);

  const {
    setTrackItem: setLayoutTrackItem,
    setFloatingControl,
    setLabelControlItem,
    setTypeControlItem,
  } = useLayoutStore();

  const isLargeScreen = useIsLargeScreen();

  /** GROUPS **/
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);
  const groups = useEditorStore((s) => s.groups);

  useEffect(() => {
    if (!selectedGroupId) return;

    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return;

    const videoItem = Object.values(trackItemsMap).find(
      (i) => i.type === "video"
    );
    if (!videoItem) return;

    const duration = Math.max(0.5, group.end - group.start);

    const nextTimelineStart = group.start;
    const nextTrimStart = group.start;
    const nextTrimEnd = group.start + duration;

    // 🛑 ВАЖНО: защита от лишних обновлений
    const isSame =
      videoItem.timelineStart === nextTimelineStart &&
      videoItem.trim?.start === nextTrimStart &&
      videoItem.trim?.end === nextTrimEnd;

    if (isSame) return;

    updateTrackItem(videoItem.id, {
      timelineStart: nextTimelineStart,
      trim: {
        start: nextTrimStart,
        end: nextTrimEnd,
      },
    });
  }, [selectedGroupId]); // ❗️ ТОЛЬКО selectedGroupId


  /**
   * активный элемент
   */
  useEffect(() => {
    if (activeIds.length === 1) {
      const id = activeIds[0];
      const item = trackItemsMap[id] ?? null;
      setTrackItem(item);

      const iTrackItem = item ? convertToITrackItem(item) : null;
      setLayoutTrackItem?.(iTrackItem);
    } else {
      setTrackItem(null);
      setLayoutTrackItem?.(null);
    }
  }, [activeIds, trackItemsMap, setLayoutTrackItem]);

  useEffect(() => {
    setFloatingControl?.("");
    setLabelControlItem?.("");
    setTypeControlItem?.("");
  }, [isLargeScreen, setFloatingControl, setLabelControlItem, setTypeControlItem]);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar
        projectName={projectName}
        user={null}
        stateManager={stateManager}
        setProjectName={setProjectName}
      />

      <div className="flex flex-1">
        {isLargeScreen && (
          <div className="bg-muted flex flex-none border-r h-[calc(100vh-44px)]">
            <MenuList />
            <MenuItem />
          </div>
        )}

        <ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
          <ResizablePanel defaultSize={70}>
            <FloatingControl />
            <CropModal />
            <Scene ref={sceneRef} />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={30}>
            <Timeline />
          </ResizablePanel>

          {!isLargeScreen && !trackItem && <MenuListHorizontal />}
          {!isLargeScreen && trackItem && <ControlItemHorizontal />}
        </ResizablePanelGroup>

        <ControlItem />
      </div>
    </div>
  );
};

export default Editor;
