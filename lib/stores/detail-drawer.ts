import { create } from "zustand";
import type { DetailKind } from "@/app/actions/detail";

interface DrawerState {
  open: boolean;
  kind: DetailKind | null;
  id: string | null;
  show: (kind: DetailKind, id: string) => void;
  hide: () => void;
  setOpen: (v: boolean) => void;
}

export const useDetailDrawer = create<DrawerState>((set) => ({
  open: false,
  kind: null,
  id: null,
  show: (kind, id) => set({ open: true, kind, id }),
  hide: () => set({ open: false }),
  setOpen: (v) => set({ open: v }),
}));
