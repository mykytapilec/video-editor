import React, { useEffect, useState } from "react";
import {
  IAudio,
  ICaption,
  IImage,
  ITrackItem,
  ITrackItemAndDetails,
  IVideo
} from "@designcombo/types";
import useLayoutStore from "./store/use-layout-store";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { Icons } from "@/components/shared/icons";
import BasicText from "./control-item/basic-text";
import BasicCaption from "./control-item/basic-caption";
import BasicImage from "./control-item/basic-image";
import BasicVideo from "./control-item/basic-video";
import BasicAudio from "./control-item/basic-audio";
import { motion, PanInfo, useAnimation } from "framer-motion";
import ColorPicker from "@/components/color-picker";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { Label } from "@/components/ui/label";
import { convertToITrackItem } from "@/utils/convertToITrackItem";
import useTimelineStore from "./store/use-timeline-store";

const ActiveControlItem = ({
  trackItem,
  handleMenuItemClick
}: {
  trackItem?: ITrackItemAndDetails;
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => {
  return (
    <>
      {
        {
          text: <ItemText handleMenuItemClick={handleMenuItemClick} />,
          caption: <ItemCaption handleMenuItemClick={handleMenuItemClick} />,
          image: <ItemImage handleMenuItemClick={handleMenuItemClick} />,
          video: <ItemVideo handleMenuItemClick={handleMenuItemClick} />,
          audio: <ItemAudio handleMenuItemClick={handleMenuItemClick} />
        }[trackItem?.type as "text"]
      }
    </>
  );
};

const ColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#ffffff");
  const [open, setOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();

  useEffect(() => {
    // Get the current color from track item details based on type
    let currentColor = "#ffffff";
    if (trackItem?.type === "text") {
      currentColor = trackItem.details?.color || "#ffffff";
    } else if (trackItem?.type === "caption") {
      currentColor = trackItem.details?.appearedColor || "#ffffff";
    } else if (trackItem?.type === "image" || trackItem?.type === "video") {
      currentColor = trackItem.details?.background || "#ffffff";
    }
    setLocalValue(currentColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the appropriate property based on track item type
    const updatePayload: any = {};

    if (trackItem?.type === "text") {
      updatePayload.color = color;
    } else if (trackItem?.type === "caption") {
      updatePayload.appearedColor = color;
    } else if (trackItem?.type === "image" || trackItem?.type === "video") {
      updatePayload.background = color;
    }

    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: updatePayload
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      ß<Label className="font-sans text-xs font-semibold">Color</Label>
      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const StrokeColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#000000");
  const [open, setOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen } = useLayoutStore();

  useEffect(() => {
    // Get the current border color from track item details
    const currentBorderColor = trackItem?.details?.borderColor || "#000000";
    setLocalValue(currentBorderColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the border color using the dispatch system
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: {
            borderColor: color
          }
        }
      }
    });
  };

  const handleClose = () => {
    setControItemDrawerOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">Stroke Color</Label>

      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const ShadowColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#000000");
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen } = useLayoutStore();

  useEffect(() => {
    // Get the current shadow color from track item details
    const currentShadowColor =
      trackItem?.details?.boxShadow?.color || "#000000";
    setLocalValue(currentShadowColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the shadow color using the dispatch system
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: {
            boxShadow: {
              ...trackItem?.details?.boxShadow,
              color: color
            }
          }
        }
      }
    });
  };

  const handleClose = () => {
    setControItemDrawerOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">Shadow Color</Label>

      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const BackgroundColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#ffffff");
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen } = useLayoutStore();

  useEffect(() => {
    // Get the current background color from track item details
    const currentBackgroundColor = trackItem?.details?.background || "#ffffff";
    setLocalValue(currentBackgroundColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the background color using the dispatch system
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: {
            background: color
          }
        }
      }
    });
  };

  const handleClose = () => {
    setControItemDrawerOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">
        Background Color
      </Label>

      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const CaptionAppearedColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#ffffff");
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen } = useLayoutStore();

  useEffect(() => {
    // Get the current appeared color from track item details
    const currentAppearedColor = trackItem?.details?.appearedColor || "#ffffff";
    setLocalValue(currentAppearedColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the appeared color using the dispatch system
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: {
            appearedColor: color
          }
        }
      }
    });
  };

  const handleClose = () => {
    setControItemDrawerOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">Appeared Color</Label>

      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const CaptionActiveColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#ffffff");
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen } = useLayoutStore();

  useEffect(() => {
    // Get the current active color from track item details
    const currentActiveColor = trackItem?.details?.activeColor || "#ffffff";
    setLocalValue(currentActiveColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the active color using the dispatch system
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: {
            activeColor: color
          }
        }
      }
    });
  };

  const handleClose = () => {
    setControItemDrawerOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">Active Color</Label>

      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const CaptionActiveFillColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#ffffff");
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen } = useLayoutStore();

  useEffect(() => {
    // Get the current active fill color from track item details
    const currentActiveFillColor =
      trackItem?.details?.activeFillColor || "#ffffff";
    setLocalValue(currentActiveFillColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the active fill color using the dispatch system
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: {
            activeFillColor: color
          }
        }
      }
    });
  };

  const handleClose = () => {
    setControItemDrawerOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">
        Active Fill Color
      </Label>

      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const CaptionEmphasizeColorPickerControl = ({
  trackItem
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  const [localValue, setLocalValue] = useState<string>("#ffffff");

  useEffect(() => {
    // Get the current active fill color from track item details
    const currentActiveFillColor =
      trackItem?.details?.isKeywordColor || "#ffffff";
    setLocalValue(currentActiveFillColor);
  }, [trackItem]);

  const handleColorChange = (color: string) => {
    setLocalValue(color);

    // Update the active fill color using the dispatch system
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem?.id || ""]: {
          details: {
            isKeywordColor: color
          }
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label className="font-sans text-xs font-semibold">Emphasize Color</Label>

      <div className="flex items-center pb-4 justify-center">
        <ColorPicker
          value={localValue}
          format="hex"
          gradient={true}
          solid={true}
          onChange={handleColorChange}
          allowAddGradientStops={true}
        />
      </div>
    </div>
  );
};

const ControlItem = ({
  trackItem,
  feature
}: {
  trackItem?: ITrackItemAndDetails;
  feature: string;
}) => {
  // First check if it's a custom feature (like strokeColor, color, shadowColor, backgroundColor, caption colors)
  if (feature === "strokeColor") {
    return <StrokeColorPickerControl trackItem={trackItem} />;
  }

  if (feature === "color") {
    return <ColorPickerControl trackItem={trackItem} />;
  }

  if (feature === "shadowColor") {
    return <ShadowColorPickerControl trackItem={trackItem} />;
  }

  if (feature === "backgroundColor") {
    return <BackgroundColorPickerControl trackItem={trackItem} />;
  }

  if (feature === "appearedColor") {
    return <CaptionAppearedColorPickerControl trackItem={trackItem} />;
  }

  if (feature === "activeColor") {
    return <CaptionActiveColorPickerControl trackItem={trackItem} />;
  }

  if (feature === "activeFillColor") {
    return <CaptionActiveFillColorPickerControl trackItem={trackItem} />;
  }
  if (feature === "emphasizeColor") {
    return <CaptionEmphasizeColorPickerControl trackItem={trackItem} />;
  }

  // Then check track item type for standard features
  return (
    <>
      {
        {
          text: (
            <BasicText
              trackItem={trackItem as ITrackItem & any}
              type={feature}
            />
          ),
          caption: (
            <BasicCaption
              trackItem={trackItem as ITrackItem & ICaption}
              type={feature}
            />
          ),
          image: (
            <BasicImage
              trackItem={trackItem as ITrackItem & IImage}
              type={feature}
            />
          ),
          video: (
            <BasicVideo
              trackItem={trackItem as ITrackItem & IVideo}
              type={feature}
            />
          ),
          audio: (
            <BasicAudio
              trackItem={trackItem as ITrackItem & IAudio}
              type={feature}
            />
          )
        }[trackItem?.type as "text"]
      }
    </>
  );
};

export default function ControlItemHorizontal() {
  return null;
}

type Item = {
  icon: React.ComponentType<{ width: number }>;
  label: string;
  id: string;
};

const ItemGroup = ({
  items,
  handleMenuItemClick
}: {
  items: Item[];
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => {
  const { typeControlItem } = useLayoutStore();
  return (
    <div className="flex items-center justify-center space-x-4 min-w-max px-4">
      {items.map(({ label, id }, index) => {
        const isActive = typeControlItem === id;
        return (
          <Button
            key={index}
            onClick={() => handleMenuItemClick(id, label)}
            variant={isActive ? "default" : "ghost"}
            size={"sm"}
            className="text-muted-foreground"
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};

const ItemText = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.preset, label: "Preset", id: "textPreset" },
      { icon: Icons.style, label: "Styles", id: "textControls" },
      { icon: Icons.animation, label: "Animations", id: "animations" },
      { icon: Icons.fontStroke, label: "Stroke", id: "fontStroke" },
      { icon: Icons.fontShadow, label: "Shadow", id: "fontShadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemCaption = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.preset, label: "Preset", id: "captionPreset" },
      { icon: Icons.type, label: "Words", id: "captionWords" },
      { icon: Icons.style, label: "Styles", id: "textControls" },
      { icon: Icons.animation, label: "Colors", id: "captionColors" },
      { icon: Icons.fontStroke, label: "Stroke", id: "fontStroke" },
      { icon: Icons.fontShadow, label: "Shadow", id: "fontShadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemImage = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.crop, label: "Crop", id: "crop" },
      { icon: Icons.basic, label: "Basic", id: "basic" },
      { icon: Icons.animation, label: "Animations", id: "animations" },
      { icon: Icons.outline, label: "Outline", id: "outline" },
      { icon: Icons.shadow, label: "Shadow", id: "shadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemVideo = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.crop, label: "Crop", id: "crop" },
      { icon: Icons.basic, label: "Basic", id: "basic" },
      { icon: Icons.animation, label: "Animations", id: "animations" },
      { icon: Icons.outline, label: "Outline", id: "outline" },
      { icon: Icons.shadow, label: "Shadow", id: "shadow" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);

const ItemAudio = ({
  handleMenuItemClick
}: {
  handleMenuItemClick: (menuItem: string, label: string) => void;
}) => (
  <ItemGroup
    items={[
      { icon: Icons.audio, label: "Replace", id: "replace" },
      { icon: Icons.speed, label: "Speed", id: "speed" },
      { icon: Icons.volume, label: "Volume", id: "volume" }
    ]}
    handleMenuItemClick={handleMenuItemClick}
  />
);
