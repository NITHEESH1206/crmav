import { create } from "zustand";

interface MobileNavState {
  open: boolean;
  show: () => void;
  hide: () => void;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

export const useMobileNav = create<MobileNavState>((set, get) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
  setOpen: (v) => set({ open: v }),
  toggle: () => set({ open: !get().open }),
}));
