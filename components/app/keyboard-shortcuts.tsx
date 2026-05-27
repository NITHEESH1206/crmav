"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuickCreate } from "@/lib/stores/quick-create";
import { useAssistant } from "@/lib/stores/assistant";
import { useDetailDrawer } from "@/lib/stores/detail-drawer";
import { NAV_BY_HINT_LETTER } from "@/lib/nav";
import { Keyboard, Sparkles } from "lucide-react";

type Shortcut = { keys: string[]; label: string; group: string };

const SHORTCUTS: Shortcut[] = [
  // General
  { keys: ["⌘", "K"], label: "Open command palette",        group: "General" },
  { keys: ["⌘", "/"], label: "Ask AI in current context",   group: "General" },
  { keys: ["⌘", "\\"], label: "Switch workspace",           group: "General" },
  { keys: ["⌘", "."], label: "Toggle sidebar",              group: "General" },
  { keys: ["?"],      label: "Show keyboard shortcuts",     group: "General" },
  { keys: ["Esc"],    label: "Close dialog / drawer",       group: "General" },

  // Navigation (G + letter chord)
  { keys: ["G", "D"], label: "Go to Dashboard",     group: "Navigation" },
  { keys: ["G", "K"], label: "Go to Calendar",      group: "Navigation" },
  { keys: ["G", "O"], label: "Go to Opportunities", group: "Navigation" },
  { keys: ["G", "A"], label: "Go to Accounts",      group: "Navigation" },
  { keys: ["G", "P"], label: "Go to Projects",      group: "Navigation" },
  { keys: ["G", "C"], label: "Go to Catalog",       group: "Navigation" },
  { keys: ["G", "I"], label: "Go to Inventory",     group: "Navigation" },
  { keys: ["G", "S"], label: "Go to Service",       group: "Navigation" },
  { keys: ["G", "B"], label: "Go to Billing",       group: "Navigation" },
  { keys: ["G", "R"], label: "Go to Reports",       group: "Navigation" },
  { keys: ["G", "T"], label: "Go to To Dos",        group: "Navigation" },

  // Create
  { keys: ["N"],       label: "New (context aware)",  group: "Create" },
  { keys: ["⇧", "O"], label: "New opportunity",      group: "Create" },
  { keys: ["⇧", "P"], label: "New project",          group: "Create" },
  { keys: ["⇧", "T"], label: "New ticket",           group: "Create" },
  { keys: ["⇧", "N"], label: "New task",             group: "Create" },

  // List ops
  { keys: ["J"],   label: "Next row",                group: "Lists" },
  { keys: ["K"],   label: "Previous row",            group: "Lists" },
  { keys: ["E"],   label: "Edit selected",           group: "Lists" },
  { keys: ["X"],   label: "Multi-select row",        group: "Lists" },
  { keys: ["F"],   label: "Focus filter",            group: "Lists" },
  { keys: ["R"],   label: "Refresh view",            group: "Lists" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const showQuickCreate = useQuickCreate((s) => s.show);
  const showAssistant = useAssistant((s) => s.show);
  const hideDetail = useDetailDrawer((s) => s.hide);

  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const isTyping = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target.isContentEditable
      );
    };

    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // ⌘K — command palette (TODO Phase 3: opens omnibox; today: opens AI as fallback)
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        // Dispatch a custom event the palette component will listen for.
        window.dispatchEvent(new CustomEvent("zynex:open-palette"));
        return;
      }

      // ⌘/ — AI in current context
      if (mod && e.key === "/") {
        e.preventDefault();
        showAssistant();
        return;
      }

      // Esc — close help dialog and detail drawer
      if (e.key === "Escape") {
        if (helpOpen) setHelpOpen(false);
        hideDetail();
        return;
      }

      // Ignore further bare-letter shortcuts when typing
      if (isTyping(e.target)) return;
      if (mod || e.altKey) return;

      // ? — open help
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // Shift + letter — create variants
      if (e.shiftKey) {
        const k = e.key.toUpperCase();
        if (k === "O") return showQuickCreate("opportunity");
        if (k === "P") return showQuickCreate("project");
        if (k === "T") return showQuickCreate("ticket");
        if (k === "N") return showQuickCreate("todo");
        return;
      }

      // 'g' + letter — navigation chord
      if (e.key === "g" || e.key === "G") {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 800);
        return;
      }
      if (gPressed) {
        gPressed = false;
        if (gTimer) clearTimeout(gTimer);
        const target = NAV_BY_HINT_LETTER[e.key.toLowerCase()];
        if (target) {
          e.preventDefault();
          router.push(target);
        }
        return;
      }

      // 'n' — new (defaults to task)
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        showQuickCreate("todo");
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [router, showQuickCreate, showAssistant, hideDetail, helpOpen]);

  // Group shortcuts for the help dialog
  const groups = Array.from(new Set(SHORTCUTS.map((s) => s.group)));

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-ink-300/55 text-[10.5px] uppercase tracking-[0.16em] font-semibold">
            <Keyboard className="h-3 w-3" />
            Keyboard shortcuts
          </div>
          <DialogTitle>Move at the speed of keys</DialogTitle>
          <DialogDescription>
            Every workflow has a chord. Press <span className="kbd">?</span> anywhere to see this again.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {groups.map((group) => (
              <div key={group}>
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-300/45 font-semibold mb-2">
                  {group}
                </div>
                <div className="space-y-1">
                  {SHORTCUTS.filter((s) => s.group === group).map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-[13px] text-ink-300/85">{s.label}</span>
                      <div className="flex items-center gap-1">
                        {s.keys.map((k, j) => (
                          <span key={j} className="kbd">{k}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-bone-300/55 flex items-center gap-2 text-caption text-ink-300/60">
            <Sparkles className="h-3 w-3 text-signal-500" />
            Tip: Press <span className="kbd mx-0.5">⌘K</span> to search and run commands without your mouse.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
