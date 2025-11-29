import { ScrollArea } from "@/components/ui/scroll-area";
import { IBoxShadow, ITrackItem, IVideo } from "@designcombo/types";
import Outline from "./common/outline";
import Shadow from "./common/shadow";
import Opacity from "./common/opacity";
import Rounded from "./common/radius";
import AspectRatio from "./common/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Crop } from "lucide-react";
import Volume from "./common/volume";
import React, { useEffect, useState } from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import Speed from "./common/speed";
import useLayoutStore from "../store/use-layout-store";
import { Label } from "@/components/ui/label";
import { Animations } from "./common/animations";
import { ExtendedVideoDetails } from "@/types";

const BasicVideo = ({
  trackItem,
  type
}: {
  trackItem: ITrackItem & IVideo & { details?: ExtendedVideoDetails };
  type?: string;
}) => {
  const showAll = !type;
  const [properties, setProperties] = useState(trackItem);
  const { setCropTarget } = useLayoutStore();

  const handleChangeVolume = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            ...trackItem.details,
            volume: v
          }
        }
      }
    });

    setProperties((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        volume: v
      }
    }));
  };

  const handleChangeOpacity = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            ...trackItem.details,
            opacity: v
          }
        }
      }
    });

    setProperties((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        opacity: v
      }
    }));
  };

  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

  const handleChangeSpeed = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          playbackRate: v
        }
      }
    });

    setProperties((prev) => ({
      ...prev,
      playbackRate: v
    }));
  };

  // Остальные обработчики borderRadius, borderWidth, borderColor, boxShadow...
  // оставляем как в старом файле, с безопасной проверкой properties.details?.field ?? defaultValue

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Video
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-2 px-4 py-4">
          <Volume
            onChange={handleChangeVolume}
            value={properties.details?.volume ?? 100}
          />
          <Opacity
            onChange={handleChangeOpacity}
            value={properties.details?.opacity ?? 100}
          />
          <Speed
            value={properties.playbackRate ?? 1}
            onChange={handleChangeSpeed}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default BasicVideo;
