// GroupsList.tsx
import GroupItem from "./GroupItem";
import NewGroupForm from "./NewGroupForm";
import useTimelineStore from "../store/use-timeline-store";

export default function GroupsList() {
  const groups = useTimelineStore((s) => s.groups);

  return (
    <div className="flex flex-col gap-2">
      <NewGroupForm />
      {groups.map((g, i) => (
        <GroupItem key={g.id} group={g} index={i} />
      ))}
    </div>
  );
}
