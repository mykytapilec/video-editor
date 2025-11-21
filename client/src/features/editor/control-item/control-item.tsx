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

const Container = ({ children }: { children: React.ReactNode }) => {
  const { activeIds, trackItemsMap } = useStore(); // ONLY here
  const [trackItem, setTrackItem] = useState<any>(null);

  const { setTrackItem: setLayoutTrackItem } = useLayoutStore();
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);

  useEffect(() => {
    let item = null;

    // 1. group selected → prefer
    if (selectedGroupId) {
      item = trackItemsMap[selectedGroupId] || null;
    }
    // 2. fallback: normal item selection
    else if (activeIds.length === 1) {
      const [id] = activeIds;
      item = trackItemsMap[id] || null;
    }

    setTrackItem(item);
    setLayoutTrackItem(item);
  }, [activeIds, trackItemsMap, selectedGroupId]);

  return (
    <div className="flex w-[272px] flex-none border-l border-border/80 bg-muted hidden lg:block">
      {React.cloneElement(children as React.ReactElement<any>, {
        trackItem
      })}
    </div>
  );
};

const ActiveControlItem = ({ trackItem }: { trackItem?: ITrackItemAndDetails }) => {
  if (!trackItem) {
    return (
      <div className="pb-32 flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground h-[calc(100vh-58px)]">
        <LassoSelect />
        <span className="text-zinc-500">No item selected</span>
      </div>
    );
  }

  return (
    <>
      {
        {
          text: <BasicText trackItem={trackItem as any} />,
          caption: <BasicCaption trackItem={trackItem as any} />,
          image: <BasicImage trackItem={trackItem as any} />,
          video: <BasicVideo trackItem={trackItem as any} />,
          audio: <BasicAudio trackItem={trackItem as any} />
        }[trackItem.type]
      }
    </>
  );
};

export const ControlItem = () => {
  return (
    <Container>
      <ActiveControlItem />
    </Container>
  );
};
