"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, RefreshCw, MessageSquare, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/ai/markdown";
import { Button } from "@/components/ui/button";
import { useGeneration, GENERATION_ROUTES } from "@/lib/stores/generation";
import { cn } from "@/lib/utils";

type RunState = "idle" | "streaming" | "done" | "error";

/**
 * Universal Generation Drawer — every "✦ Generate X" action across the app
 * opens this surface. Streams from the endpoint defined in GENERATION_ROUTES,
 * renders markdown live, and exposes Accept / Refine / Discard.
 */
export function GenerationDrawer() {
  const { open, context, hide } = useGeneration();
  const [content, setContent] = useState("");
  const [state, setState] = useState<RunState>("idle");
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Kick off generation when the drawer opens with new context
  useEffect(() => {
    if (!open || !context) return;
    void run({});
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, context?.entityId, context?.kind]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, hide]);

  async function run({ refinement }: { refinement?: string }) {
    if (!context) return;
    const route = GENERATION_ROUTES[context.kind];
    if (!route) {
      setState("error");
      setContent("Unknown generation kind: " + context.kind);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("streaming");
    setContent("");

    try {
      const res = await fetch(route.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          // Endpoints accept whichever id field matches them — send both.
          entityId: context.entityId,
          opportunityId: context.entityId,
          projectId: context.entityId,
          ticketId: context.entityId,
          accountId: context.entityId,
          roomId: context.entityId,
          refinement,
        }),
      });
      if (!res.ok || !res.body) {
        setState("error");
        setContent(`Request failed (${res.status})`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        setContent(buf);
      }
      setState("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState("error");
      setContent(`Generation failed: ${(err as Error).message}`);
    }
  }

  function handleAccept() {
    // For now: copy to clipboard + toast. Per-kind "Accept" handlers (e.g.,
    // writing BOQ rows to the project) wire up here in a follow-up.
    navigator.clipboard.writeText(content);
    toast.success("Result copied", {
      description: "Paste into the target document or hand to the team.",
    });
    hide();
  }

  function handleDiscard() {
    abortRef.current?.abort();
    hide();
  }

  function handleRefine() {
    if (!refineText.trim()) return;
    void run({ refinement: refineText.trim() });
    setRefineOpen(false);
    setRefineText("");
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }

  const route = context ? GENERATION_ROUTES[context.kind] : null;

  return (
    <AnimatePresence>
      {open && context && route && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={hide}
            className="absolute inset-0 bg-ink-300/25 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-[640px] bg-white border-l border-bone-300/65 flex flex-col"
          >
            {/* Header */}
            <header className="px-5 py-4 border-b border-bone-300/55 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-signal-600 font-semibold">
                  <Sparkles className="h-3 w-3" />
                  AI · {route.verb}
                </div>
                <h2 className="mt-1 text-heading-md text-ink-300 truncate">{route.title}</h2>
                {context.sourceLabel && (
                  <p className="text-caption text-ink-300/55 mt-0.5 truncate">
                    For · {context.sourceLabel}
                  </p>
                )}
              </div>
              <button
                onClick={hide}
                className="h-8 w-8 rounded-md text-ink-300/55 hover:text-ink-300 hover:bg-bone-100 flex items-center justify-center shrink-0"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            {/* Sources / provenance toggle */}
            <button
              onClick={() => setSourcesOpen((v) => !v)}
              className="px-5 py-2 border-b border-bone-300/45 flex items-center justify-between text-[11.5px] text-ink-300/65 hover:bg-bone-50 transition-colors"
            >
              <span>Sources · Claude Opus 4.7 · workspace context</span>
              {sourcesOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            {sourcesOpen && (
              <div className="px-5 py-3 border-b border-bone-300/45 bg-bone-50/60 text-[11.5px] text-ink-300/65 space-y-1">
                <div>· Entity: {context.entityLabel}</div>
                <div>· Endpoint: <span className="font-mono">{route.endpoint}</span></div>
                <div>· Model: Claude Opus 4.7 · adaptive thinking · prompt-cached system</div>
                <div>· This output is AI-generated. Review before sharing with a client.</div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {state === "idle" && (
                <div className="text-[12.5px] text-ink-300/55">Preparing…</div>
              )}
              {state === "streaming" && content.length === 0 && (
                <StreamingSkeleton />
              )}
              {(state === "streaming" || state === "done" || state === "error") && content && (
                <div className="relative">
                  <Markdown text={content} />
                  {state === "streaming" && (
                    <span className="inline-block w-1.5 h-4 align-text-bottom bg-signal-500 ml-0.5 animate-pulse" />
                  )}
                </div>
              )}
            </div>

            {/* Refine row */}
            {refineOpen && (
              <div className="px-5 py-3 border-t border-bone-300/55 bg-bone-50">
                <label className="text-[11px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                  How should it be different?
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    autoFocus
                    value={refineText}
                    onChange={(e) => setRefineText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleRefine();
                      }
                    }}
                    placeholder='e.g. "Make it for 12 seats instead of 8"'
                    className="flex-1 h-9 rounded-md border border-bone-300/65 bg-white px-3 text-[13px] text-ink-300 placeholder:text-ink-300/40 outline-none focus:border-ink-300/30"
                  />
                  <Button size="sm" onClick={handleRefine}>
                    Re-run
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRefineOpen(false);
                      setRefineText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Action bar */}
            <footer className="px-5 py-3 border-t border-bone-300/55 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[10.5px] text-ink-300/55">
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    state === "streaming" && "bg-signal-500 animate-pulse",
                    state === "done" && "bg-status-success-fg",
                    state === "error" && "bg-status-danger-fg",
                    state === "idle" && "bg-ink-300/30"
                  )}
                />
                {state === "streaming" && "Streaming…"}
                {state === "done" && "Generation complete"}
                {state === "error" && "Generation failed"}
                {state === "idle" && "Ready"}
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" onClick={handleCopy} disabled={!content}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setRefineOpen((v) => !v)}
                  disabled={state === "streaming"}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Refine
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => run({})}
                  disabled={state === "streaming"}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-run
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDiscard}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleAccept} disabled={!content || state === "streaming"}>
                  <Check className="h-3.5 w-3.5" />
                  Accept
                </Button>
              </div>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function StreamingSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      <div className="h-3 w-2/3 rounded bg-bone-200" />
      <div className="h-3 w-full rounded bg-bone-200" />
      <div className="h-3 w-5/6 rounded bg-bone-200" />
      <div className="h-3 w-1/2 rounded bg-bone-200" />
    </div>
  );
}
