import { create } from "zustand";

type Kind = "todo" | "opportunity" | "ticket" | "project";

interface QuickCreateState {
  open: boolean;
  kind: Kind;
  show: (kind?: Kind) => void;
  hide: () => void;
  setOpen: (v: boolean) => void;
}

export const useQuickCreate = create<QuickCreateState>((set) => ({
  open: false,
  kind: "todo",
  show: (kind = "todo") => set({ open: true, kind }),
  hide: () => set({ open: false }),
  setOpen: (v) => set({ open: v }),
}));
