import React, { useEffect, useState } from "react";
import BasicText from "./basic-text";
import BasicImage from "./basic-image";
import BasicVideo from "./basic-video";
import BasicAudio from "./basic-audio";
import BasicCaption from "./basic-caption";
import { LassoSelect } from "lucide-react";

import useStore from "../store/use-store";
import useLayoutStore from "../store/use-layout-store";
import { useEditorStore } from "../store/use-editor-store";
import { convertToITrackItem } from "@/utils/convertToITrackItem";

const BasicGroup = ({ group }: any) => (
  <div className="p-4 text-sm text-zinc-300">
    <h3 className="font-semibold mb-2">Group #{group.id}</h3>
    <div>Text: {group.text}</div>
    <div>Start: {group.start}</div>
    <div>End: {group.end}</div>
  </div>
);

const Container = ({ children }: { children: React.ReactNode }) => {
  const { activeIds, trackItemsMap } = useStore();
  const { groups, selectedGroupId } = useEditorStore();
  const { setTrackItem: setLayoutTrackItem } = useLayoutStore();

  const [trackItem, setTrackItem] = useState<any | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  useEffect(() => {
    if (selectedGroupId !== null) {
      const group = groups.find((g) => g.id === selectedGroupId) || null;
      setSelectedGroup(group);

      setTrackItem(null);
      setLayoutTrackItem(null);
      return;
    }

    setSelectedGroup(null);

    if (activeIds.length === 1) {
      const id = activeIds[0];
      const item = trackItemsMap[id] || null;
      setTrackItem(item);

      const iItem = item && item.type === "video" ? convertToITrackItem(item) : null;
      setLayoutTrackItem(iItem);
    } else {
      setTrackItem(null);
      setLayoutTrackItem(null);
    }
  }, [activeIds, trackItemsMap, selectedGroupId, groups, setLayoutTrackItem]);

  return (
    <div className="flex w-[272px] flex-none border-l border-border/80 bg-muted hidden lg:block">
      {React.cloneElement(children as React.ReactElement<any>, {
        trackItem,
        selectedGroup,
      })}
    </div>
  );
};

const ActiveControlItem = ({
  trackItem,
  selectedGroup,
}: {
  trackItem?: any | null;
  selectedGroup?: any | null;
}) => {
  if (selectedGroup) return <BasicGroup group={selectedGroup} />;
  if (!trackItem) {
    return (
      <div className="pb-32 flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground h-[calc(100vh-58px)]">
        <LassoSelect />
        <span className="text-zinc-500">No item selected</span>
      </div>
    );
  }

  const panels: Record<string, React.ReactNode> = {
    text: <BasicText trackItem={trackItem} />,
    caption: <BasicCaption trackItem={trackItem} />,
    image: <BasicImage trackItem={trackItem} />,
    video: <BasicVideo trackItem={trackItem} />,
    audio: <BasicAudio trackItem={trackItem} />,
  };

  return <>{panels[trackItem.type] ?? null}</>;
};

export const ControlItem = () => {
  return (
    <Container>
      <ActiveControlItem />
    </Container>
  );
};

export default ControlItem;
