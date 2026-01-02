import { TimelineGroup } from "@/types";

const API_URL = "http://localhost:3001/groups";

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
    throw new Error("Failed to update group");
  }

  return res.json();
}
