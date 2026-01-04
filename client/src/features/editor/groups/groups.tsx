"use client";

import GroupsList from "./GroupsList";
import { EditorBootstrap } from "./EditorBootstrap";
import ApiModal from "@/components/api-modal";

export default function Groups() {
  return (
    <div className="p-3 flex flex-col gap-2 w-[300px]">
      <GroupsList />
      <EditorBootstrap />
      <ApiModal />
    </div>
  );
}
