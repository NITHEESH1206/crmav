"use client";

import { QuickCreateDialog } from "@/components/app/quick-create-dialog";
import { useQuickCreate } from "@/lib/stores/quick-create";

type Lookups = {
  accounts: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  users: { id: string; name: string }[];
};

export function QuickCreateProvider({ lookups }: { lookups: Lookups }) {
  const { open, kind, setOpen } = useQuickCreate();
  return (
    <QuickCreateDialog
      open={open}
      onOpenChange={setOpen}
      lookups={lookups}
      defaultTab={kind}
    />
  );
}
