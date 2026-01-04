"use client";

import { TimelineGroup } from "@/types";

const API_URL = "http://localhost:3001/groups";

export interface TimelineGroupCreateDto {
  start: number;
  end: number;
  text: string;
  sourceId: number;
  name: string;
  idx: number;
}

export async function createGroupApi(group: TimelineGroupCreateDto) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message?.[0] || "Failed to create group");
  }

  return res.json() as Promise<TimelineGroup>;
}

export async function updateGroupApi(
  id: string,
  patch: Partial<TimelineGroup>
) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message?.[0] || "Failed to update group");
  }

  return res.json();
}

export async function deleteGroupApi(id: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message?.[0] || "Failed to delete group");
  }

  return res.json();
}

