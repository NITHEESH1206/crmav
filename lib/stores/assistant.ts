import { create } from "zustand";

interface AssistantState {
  open: boolean;
  show: () => void;
  hide: () => void;
  setOpen: (v: boolean) => void;
}

export const useAssistant = create<AssistantState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
  setOpen: (v) => set({ open: v }),
}));
