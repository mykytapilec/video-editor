"use client";

import React, { useEffect, useRef, useState } from "react";
import useStore from "./store/use-store";
import Navbar from "./navbar";
import Scene from "./scene/scene";
import StateManager from "@designcombo/state";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item/menu-item";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import FloatingControl from "./control-item/floating-controls/floating-control";
import CropModal from "./crop-modal/crop-modal";
import MenuListHorizontal from "./menu-list-horizontal";
import ControlItemHorizontal from "./control-item-horizontal";
import { ControlItem } from "./control-item";
import useLayoutStore from "./store/use-layout-store";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { convertToITrackItem } from "@/utils/convertToITrackItem";
import { SceneRef } from "./scene/scene.types";
import { TrackItem } from "@/types";
import Timeline from "./timeline/timeline";

const stateManager = new StateManager({
  size: { width: 1080, height: 1920 },
});

const Editor: React.FC<{ tempId?: string; id?: string }> = ({ tempId, id }) => {
  const [projectName, setProjectName] = useState("Untitled video");
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const sceneRef = useRef<SceneRef>(null);

  const activeIds = useStore((s: any) => s.activeIds);
  const trackItemsMap = useStore((s: any) => s.trackItemsMap);

  const [trackItem, setTrackItem] = useState<TrackItem | null>(null);

  const {
    setTrackItem: setLayoutTrackItem,
    setFloatingControl,
    setLabelControlItem,
    setTypeControlItem,
  } = useLayoutStore();

  const isLargeScreen = useIsLargeScreen();

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


  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar
        projectName={projectName}
        user={null}
        stateManager={stateManager as any}
        setProjectName={setProjectName}
      />

      <div className="flex flex-1">
        {isLargeScreen && (
          <div className="bg-muted flex flex-none border-r border-border/80 h-[calc(100vh-44px)]">
            <MenuList />
            <MenuItem />
          </div>
        )}

        <ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
          <ResizablePanel className="relative" defaultSize={70}>
            <FloatingControl />
            <div className="flex h-full flex-1">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <CropModal />
                <Scene ref={sceneRef} stateManager={stateManager as any} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel className="min-h-[50px]" defaultSize={30}>
            <Timeline videoSrc="/videos/Bridgertone.mp4" />
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
