"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewRoomDialog } from "./new-room-dialog";

type Option = { id: string; name: string };

/**
 * Button + dialog combo — drop it into any page toolbar to expose a quick
 * "New room" action. Pre-fills the project when one is provided.
 */
export function NewRoomTrigger({
  projects,
  accounts,
  defaultProjectId,
  label = "New room",
  size = "sm",
  variant = "default",
}: {
  projects: Option[];
  accounts: Option[];
  defaultProjectId?: string;
  label?: string;
  size?: "sm" | "default";
  variant?: "default" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} variant={variant} onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        {label}
      </Button>
      <NewRoomDialog
        open={open}
        onClose={() => setOpen(false)}
        projects={projects}
        accounts={accounts}
        defaultProjectId={defaultProjectId}
      />
    </>
  );
}
