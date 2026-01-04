import React, { useEffect, useState } from "react";
import { LassoSelect } from "lucide-react";
import useLayoutStore from "../store/use-layout-store";
import useTimelineStore from "../store/use-timeline-store";

const BasicGroup = ({ group }: any) => (
  <div className="p-4 text-sm text-zinc-300">
    <h3 className="font-semibold mb-2">Group #{group.id}</h3>
    <div>Start: {group.start}</div>
    <div>End: {group.end}</div>
  </div>
);

const Container = ({ children }: { children: React.ReactNode }) => {
  const { groups, selectedGroupId } = useTimelineStore();
  const { setTrackItem } = useLayoutStore();

  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  useEffect(() => {
    if (selectedGroupId !== null) {
      const group =
        groups.find(
          (g) => Number(g.id) === selectedGroupId
        ) || null;
      setSelectedGroup(group);
      setTrackItem(null);
    } else {
      setSelectedGroup(null);
      setTrackItem(null);
    }
  }, [selectedGroupId, groups, setTrackItem]);

  return (
    <div className="flex w-[272px] border-l border-border bg-muted hidden lg:block">
      {React.cloneElement(children as React.ReactElement<any>, {
        selectedGroup,
      })}
    </div>
  );
};

const ActiveControlItem = ({ selectedGroup }: { selectedGroup?: any }) => {
  if (selectedGroup) return <BasicGroup group={selectedGroup} />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
      <LassoSelect />
      <span>No item selected</span>
    </div>
  );
};

export const ControlItem = () => (
  <Container>
    <ActiveControlItem />
  </Container>
);

export default ControlItem;
