"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getGroups, getGroupById } from "@/api/groups";
import useStore from "@/features/editor/store/use-store";
import { parseTimestamp } from "@/utils/parseTimestamp";
import { TimelineGroup, TrackItem } from "@/types";

export const Uploads: React.FC = () => {
  const groups = useStore((s) => s.groups);
  const selectedGroupId = useStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useStore((s) => s.setSelectedGroupId);
  const setState = useStore((s) => s.setState);

  const [loading, setLoading] = useState(false);

  const handleLoadGroups = async () => {
    setLoading(true);
    try {
      const data: any[] = await getGroups();

      const parsedGroups: TimelineGroup[] = data.map((g) => ({
        id: g.id,
        idx: g.idx,
        name: g.name ?? null,
        start: parseTimestamp(g.start),
        end: parseTimestamp(g.end),
        text: g.text,
      }));

      const trackItems: Record<number, TrackItem> = {};
      parsedGroups.forEach((g) => {
        trackItems[g.id] = {
          id: g.id,
          name: g.name,
          start: g.start,
          end: g.end,
          type: "template",
        };
      });

      setState({
        groups: parsedGroups,
        trackItemsMap: trackItems,
        trackItemIds: parsedGroups.map((g) => g.id),
        activeIds: [],
      });
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (id: number) => {
    try {
      const group = await getGroupById(String(id)); 
      setSelectedGroupId(group.id); 
      console.log("Selected group:", group);
    } catch (err) {
      console.error("Error loading group:", err);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <Button onClick={handleLoadGroups} disabled={loading}>
          {loading ? "Loading..." : "Load Groups"}
        </Button>
      </div>

      {groups.length > 0 && (
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroupId === group.id ? "default" : "outline"}
              onClick={() => handleSelectGroup(group.id)}
            >
              {group.name || `Group ${group.id}`}
            </Button>
          ))}
        </div>
      )}

      {selectedGroupId !== null && (
        <div className="mt-4 border p-3 rounded-md bg-muted text-sm">
          <h3 className="font-semibold mb-2">Selected group:</h3>
          <pre className="overflow-auto max-h-60">
            {JSON.stringify(groups.find((g) => g.id === selectedGroupId), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Uploads;
