import { create } from "zustand";

/**
 * Generation Drawer store — opens the universal AI generation surface for any
 * entity / generation kind, anywhere in the app.
 *
 * Callers fire `show({ kind, entityId, entityLabel, sourceLabel })`; the drawer
 * subscribes to this store, opens, calls the matching API endpoint with the
 * entity id, streams the result, and exposes Accept / Refine / Discard.
 */

export type GenerationKind =
  // Project-scoped
  | "project-status-summary"
  | "project-risk-brief"
  | "project-boq-from-rooms"
  | "project-commissioning-checklist"
  // Opportunity-scoped
  | "opportunity-proposal"
  | "opportunity-account-brief"
  | "opportunity-email-followup"
  // Room-scoped
  | "room-boq-suggested"
  // Rack-scoped
  | "rack-suggested-layout"
  // Signal flow-scoped
  | "flow-from-boq"
  // Ticket-scoped
  | "ticket-resolution-summary"
  | "ticket-client-response"
  // Procurement-scoped
  | "po-vendor-shortlist";

export type GenerationContext = {
  kind: GenerationKind;
  /** The record id this generation is scoped to. */
  entityId: string;
  /** Human-readable label for the drawer header. */
  entityLabel: string;
  /** Short description shown under the header (e.g. "Boardroom 04"). */
  sourceLabel?: string;
};

type GenerationState = {
  open: boolean;
  context: GenerationContext | null;
  show: (ctx: GenerationContext) => void;
  hide: () => void;
};

export const useGeneration = create<GenerationState>((set) => ({
  open: false,
  context: null,
  show: (ctx) => set({ open: true, context: ctx }),
  hide: () => set({ open: false, context: null }),
}));

/** Maps a generation kind → its API route + display title. */
export const GENERATION_ROUTES: Record<
  GenerationKind,
  { endpoint: string; title: string; verb: string }
> = {
  "project-status-summary": {
    endpoint: "/api/ai/generate/project-summary",
    title: "Project status summary",
    verb: "Summarise",
  },
  "project-risk-brief": {
    endpoint: "/api/ai/generate/project-risk",
    title: "Project risk brief",
    verb: "Assess",
  },
  "project-boq-from-rooms": {
    endpoint: "/api/ai/generate/boq",
    title: "Suggested BOQ from rooms",
    verb: "Generate",
  },
  "project-commissioning-checklist": {
    endpoint: "/api/ai/generate/checklist",
    title: "Commissioning checklist",
    verb: "Generate",
  },
  "opportunity-proposal": {
    endpoint: "/api/ai/proposal",
    title: "Client proposal",
    verb: "Generate",
  },
  "opportunity-account-brief": {
    endpoint: "/api/ai/account-brief",
    title: "Account brief",
    verb: "Summarise",
  },
  "opportunity-email-followup": {
    endpoint: "/api/ai/generate/email-followup",
    title: "Follow-up email",
    verb: "Draft",
  },
  "room-boq-suggested": {
    endpoint: "/api/ai/generate/boq",
    title: "Suggested BOQ for room",
    verb: "Generate",
  },
  "rack-suggested-layout": {
    endpoint: "/api/ai/generate/rack-layout",
    title: "Suggested rack layout",
    verb: "Suggest",
  },
  "flow-from-boq": {
    endpoint: "/api/ai/generate/signal-flow",
    title: "Signal flow from BOQ",
    verb: "Generate",
  },
  "ticket-resolution-summary": {
    endpoint: "/api/ai/ticket-summary",
    title: "Resolution summary",
    verb: "Summarise",
  },
  "ticket-client-response": {
    endpoint: "/api/ai/generate/ticket-client-response",
    title: "Client-facing response",
    verb: "Draft",
  },
  "po-vendor-shortlist": {
    endpoint: "/api/ai/generate/vendor-shortlist",
    title: "Vendor shortlist",
    verb: "Recommend",
  },
};
