import { create } from "zustand";

interface CopilotState {
  open: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

export const useCopilot = create<CopilotState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
