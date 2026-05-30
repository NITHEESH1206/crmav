"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  FileSignature,
  ShieldAlert,
  ListChecks,
  Boxes,
  Network,
  Server,
  Mail,
  TrendingUp,
  Building2,
  LifeBuoy,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useCopilot } from "@/lib/stores/copilot";
import { useAssistant } from "@/lib/stores/assistant";

type Suggestion = {
  label: string;
  desc: string;
  icon: LucideIcon;
  action: () => void;
};

/**
 * AI Co-pilot rail — ⌘/ slides in a context-aware panel of suggested next
 * actions based on the current route. Each action either seeds the assistant
 * drawer with a prompt or navigates to the relevant module.
 *
 * Lightweight by design: it reads only the pathname, so it works on every
 * page without per-page wiring.
 */
export function CopilotRail() {
  const { open, hide, toggle } = useCopilot();
  const showAssistant = useAssistant((s) => s.show);
  const pathname = usePathname();
  const router = useRouter();

  // ⌘/ toggles
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && open) hide();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, hide, toggle]);

  const { title, suggestions } = useMemo(
    () => buildSuggestions(pathname, { showAssistant, router }),
    [pathname, showAssistant, router]
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={hide}
            className="absolute inset-0 bg-ink-300/20 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-[380px] glass-strong border-l border-bone-300/55 flex flex-col"
          >
            {/* Header */}
            <header className="px-5 py-4 border-b border-bone-300/40 flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-signal-700 mb-1">
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                  AI Co-pilot
                </div>
                <h2 className="text-[17px] font-medium text-ink-300 leading-tight">{title}</h2>
              </div>
              <button
                onClick={hide}
                className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300 shrink-0"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-300/50 px-2 pt-1 pb-1">
                Suggested actions
              </div>
              {suggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      s.action();
                      hide();
                    }}
                    className="hover-glass group w-full text-left rounded-2xl border border-bone-300/45 bg-white/30 p-3.5 flex items-start gap-3 transition-all"
                  >
                    <span className="h-8 w-8 rounded-xl bg-signal-500/12 border border-signal-500/20 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-signal-700" strokeWidth={1.9} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium text-ink-300 flex items-center gap-1.5">
                        {s.label}
                        <ArrowRight className="h-3 w-3 text-ink-300/35 group-hover:text-signal-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[11.5px] text-ink-300/60 mt-0.5 leading-snug">{s.desc}</div>
                    </div>
                  </button>
                );
              })}

              {/* Free-form ask */}
              <button
                type="button"
                onClick={() => {
                  showAssistant();
                  hide();
                }}
                className="hover-glass w-full text-left rounded-2xl border border-dashed border-bone-300/60 p-3.5 flex items-center gap-3 mt-2"
              >
                <span className="h-8 w-8 rounded-xl bg-ink-300/8 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-ink-300/55" strokeWidth={1.9} />
                </span>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-ink-300/85">Ask anything</div>
                  <div className="text-[11.5px] text-ink-300/55 mt-0.5">Open the full assistant</div>
                </div>
              </button>
            </div>

            <footer className="px-5 py-2.5 border-t border-bone-300/40 bg-white/30 flex items-center justify-between text-[10.5px] text-ink-300/55">
              <span>Context: {prettyRoute(pathname)}</span>
              <span className="inline-flex items-center gap-1">
                <span className="kbd">⌘/</span> toggle
              </span>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function prettyRoute(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return seg.replace(/-/g, " ");
}

function buildSuggestions(
  pathname: string,
  ctx: { showAssistant: (seed?: string) => void; router: ReturnType<typeof useRouter> }
): { title: string; suggestions: Suggestion[] } {
  const { showAssistant, router } = ctx;
  const ask = (seed: string) => () => showAssistant(seed);
  const go = (href: string) => () => router.push(href);

  if (pathname.startsWith("/projects")) {
    return {
      title: "Working on projects",
      suggestions: [
        { label: "Summarise project status", desc: "Paste-ready stand-up update", icon: ListChecks, action: ask("Summarise the status of the project I'm viewing — phase, % complete, blockers, next 7 days.") },
        { label: "Flag project risks", desc: "Schedule, margin, risk outlook", icon: ShieldAlert, action: ask("Assess the risks on this project — schedule, margin, and what to escalate.") },
        { label: "Generate commissioning checklist", desc: "Per-group task list from devices", icon: ListChecks, action: ask("Generate a commissioning checklist for this project's room and device list.") },
        { label: "Open AI Builder", desc: "Design another room with AI", icon: Sparkles, action: go("/builder") },
      ],
    };
  }
  if (pathname.startsWith("/opportunities")) {
    return {
      title: "Working on pipeline",
      suggestions: [
        { label: "Draft a proposal", desc: "Client-ready proposal narrative", icon: FileSignature, action: ask("Draft a proposal for the opportunity I'm viewing.") },
        { label: "Write a follow-up email", desc: "Stage-aware client email", icon: Mail, action: ask("Write a short follow-up email for this opportunity, matched to its stage.") },
        { label: "Score the deal", desc: "Win probability + what's missing", icon: TrendingUp, action: ask("Score this opportunity's win probability and tell me what's missing to close it.") },
      ],
    };
  }
  if (pathname.startsWith("/service")) {
    return {
      title: "Working on service",
      suggestions: [
        { label: "Summarise a ticket", desc: "Root-cause + next action", icon: LifeBuoy, action: ask("Summarise the open service ticket — likely root cause and recommended fix.") },
        { label: "Draft client response", desc: "Client-facing reply", icon: Mail, action: ask("Draft a client-facing response for this ticket — no internal jargon.") },
        { label: "Check AMC renewals", desc: "Contracts expiring soon", icon: ShieldAlert, action: go("/service?filter=amc-expiring") },
      ],
    };
  }
  if (pathname.startsWith("/accounts")) {
    return {
      title: "Working on accounts",
      suggestions: [
        { label: "Write an account brief", desc: "QBR-ready summary", icon: Building2, action: ask("Write an executive account brief for the account I'm viewing.") },
        { label: "Find expansion angles", desc: "Upsell + cross-sell ideas", icon: TrendingUp, action: ask("What are the expansion angles for this account — rooms not yet covered, AMC upsell, tier upgrade?") },
      ],
    };
  }
  if (pathname.startsWith("/rooms") || pathname.startsWith("/builder")) {
    return {
      title: "Designing rooms",
      suggestions: [
        { label: "Open AI Builder", desc: "Brief → full project in minutes", icon: Sparkles, action: go("/builder") },
        { label: "Suggest a BOQ", desc: "Equipment list for a room type", icon: Boxes, action: ask("Suggest a BOQ for a premium boardroom — 12 seats, Crestron control, Q-SYS audio.") },
        { label: "Explain signal flow", desc: "Sources → distribution → outputs", icon: Network, action: ask("Explain the typical signal flow for a dual-display boardroom with a Q-SYS Core and Shure ceiling mics.") },
      ],
    };
  }
  if (pathname.startsWith("/inventory") || pathname.startsWith("/procurement")) {
    return {
      title: "Working on supply chain",
      suggestions: [
        { label: "Vendor shortlist", desc: "Best vendors for a category", icon: Server, action: ask("Recommend a vendor shortlist for sourcing ceiling microphones at volume.") },
        { label: "Reorder recommendations", desc: "What to restock now", icon: Boxes, action: go("/inventory?filter=low-stock") },
      ],
    };
  }
  if (pathname.startsWith("/dashboard")) {
    return {
      title: "Mission Control",
      suggestions: [
        { label: "What should I do first?", desc: "Prioritise today's attention items", icon: ShieldAlert, action: ask("Look at today's Mission Control. What are the top 3 things I should tackle first and why?") },
        { label: "Open AI Builder", desc: "Start a new project", icon: Sparkles, action: go("/builder") },
        { label: "Weekly summary", desc: "Roll up the week's operations", icon: TrendingUp, action: ask("Give me a weekly operations summary — pipeline, projects, service, finance.") },
      ],
    };
  }

  // Default
  return {
    title: "How can I help?",
    suggestions: [
      { label: "Open AI Builder", desc: "Design a room with AI", icon: Sparkles, action: go("/builder") },
      { label: "Summarise my pipeline", desc: "Where deals stand", icon: TrendingUp, action: ask("Summarise my current sales pipeline and what needs attention.") },
      { label: "Today's priorities", desc: "What matters now", icon: ShieldAlert, action: go("/dashboard") },
    ],
  };
}
