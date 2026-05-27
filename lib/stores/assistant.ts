import { create } from "zustand";

interface AssistantState {
  open: boolean;
  /** Optional message seeded by the caller; the drawer pre-fills the composer. */
  seedPrompt: string | null;
  show: (seedPrompt?: string) => void;
  hide: () => void;
  setOpen: (v: boolean) => void;
  /** Drawer calls this after consuming the seed so subsequent opens are clean. */
  clearSeed: () => void;
}

export const useAssistant = create<AssistantState>((set) => ({
  open: false,
  seedPrompt: null,
  show: (seedPrompt) =>
    set({ open: true, seedPrompt: seedPrompt ?? null }),
  hide: () => set({ open: false }),
  setOpen: (v) => set({ open: v }),
  clearSeed: () => set({ seedPrompt: null }),
}));
