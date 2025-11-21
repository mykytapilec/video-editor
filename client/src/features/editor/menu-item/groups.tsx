import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useEditorStore } from "../store/use-editor-store";

export default function Groups() {
  const groups = useEditorStore((s) => s.groups);
  const fetchGroups = useEditorStore((s) => s.fetchGroups);
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useEditorStore((s) => s.setSelectedGroupId);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="p-3 flex flex-col gap-2">
      <h2 className="text-lg font-semibold mb-2">Groups</h2>

      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground">No groups loaded</p>
      )}

      {groups.map((g) => (
        <div
          key={g.id}
          onClick={() => setSelectedGroupId(g.id)}
          className={`flex items-center gap-3 border rounded-lg p-2 hover:bg-accent cursor-pointer ${
            selectedGroupId === g.id ? "ring-2 ring-yellow-400" : ""
          }`}
        >
          <ChevronLeft size={18} />
          <div>
            <div className="font-medium">ID: {g.id}</div>
            <div className="text-sm text-muted-foreground">{g.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
