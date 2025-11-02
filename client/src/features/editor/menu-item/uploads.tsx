"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getGroups, getGroupById } from "@/api/groups";

export const Uploads = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  const handleLoadGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (id: string) => {
    try {
      const group = await getGroupById(id);
      setSelectedGroup(group);
      console.log("Selected group:", group);
      // TODO
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
              variant={selectedGroup?.id === group.id ? "default" : "outline"}
              onClick={() => handleSelectGroup(group.id)}
            >
              {group.name || `Group ${group.id}`}
            </Button>
          ))}
        </div>
      )}

      {selectedGroup && (
        <div className="mt-4 border p-3 rounded-md bg-muted text-sm">
          <h3 className="font-semibold mb-2">Selected group:</h3>
          <pre className="overflow-auto max-h-60">
            {JSON.stringify(selectedGroup, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Uploads;
