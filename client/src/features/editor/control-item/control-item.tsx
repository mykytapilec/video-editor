import React, { useEffect, useState } from "react";
import {
  IAudio,
  ICaption,
  IImage,
  IText,
  IVideo,
  ITrackItemAndDetails
} from "@designcombo/types";

import BasicText from "./basic-text";
import BasicImage from "./basic-image";
import BasicVideo from "./basic-video";
import BasicAudio from "./basic-audio";
import BasicCaption from "./basic-caption";
import { LassoSelect } from "lucide-react";

import useStore from "../store/use-store";
import useLayoutStore from "../store/use-layout-store";
import { useEditorStore } from "../store/use-editor-store";

// temporary — until group panel is designed
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

  const [trackItem, setTrackItem] = useState<ITrackItemAndDetails | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  useEffect(() => {
    // if group selected → show group panel
    if (selectedGroupId !== null) {
      const group = groups.find((g) => g.id === selectedGroupId) || null;
      setSelectedGroup(group);

      // hide trackItem panel
      setTrackItem(null);
      setLayoutTrackItem(null);
      return;
    }

    // fallback → track item selection
    setSelectedGroup(null);

    if (activeIds.length === 1) {
      const [id] = activeIds;
      const item = trackItemsMap[id] || null;
      setTrackItem(item);
      setLayoutTrackItem(item);
    } else {
      setTrackItem(null);
      setLayoutTrackItem(null);
    }
  }, [activeIds, trackItemsMap, selectedGroupId, groups]);

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
  trackItem?: ITrackItemAndDetails | null;
  selectedGroup?: any | null;
}) => {
  // group mode
  if (selectedGroup) {
    return <BasicGroup group={selectedGroup} />;
  }

  // nothing selected
  if (!trackItem) {
    return (
      <div className="pb-32 flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground h-[calc(100vh-58px)]">
        <LassoSelect />
        <span className="text-zinc-500">No item selected</span>
      </div>
    );
  }

  // track item mode
  const panels: Record<string, JSX.Element> = {
    text: <BasicText trackItem={trackItem as IText} />,
    caption: <BasicCaption trackItem={trackItem as ICaption} />,
    image: <BasicImage trackItem={trackItem as IImage} />,
    video: <BasicVideo trackItem={trackItem as IVideo} />,
    audio: <BasicAudio trackItem={trackItem as IAudio} />,
  };

  return panels[trackItem.type] ?? null;
};

export const ControlItem = () => {
  return (
    <Container>
      <ActiveControlItem />
    </Container>
  );
};
