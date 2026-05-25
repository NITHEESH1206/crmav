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
import { NAV_ITEMS } from "@/lib/nav";
import { Keyboard, Sparkles } from "lucide-react";

const SHORTCUTS: { keys: string[]; label: string; group: string }[] = [
  { keys: ["?"], label: "Show keyboard shortcuts", group: "General" },
  { keys: ["⌘", "K"], label: "Ask AI assistant", group: "General" },
  { keys: ["⌘", "/"], label: "Ask AI assistant", group: "General" },
  { keys: ["N"], label: "New action (task)", group: "Create" },
  { keys: ["⇧", "O"], label: "New opportunity", group: "Create" },
  { keys: ["⇧", "P"], label: "New project", group: "Create" },
  { keys: ["⇧", "T"], label: "New ticket", group: "Create" },
  { keys: ["G", "D"], label: "Go to Dashboard", group: "Navigation" },
  { keys: ["G", "O"], label: "Go to Opportunities", group: "Navigation" },
  { keys: ["G", "P"], label: "Go to Projects", group: "Navigation" },
  { keys: ["G", "S"], label: "Go to Service", group: "Navigation" },
  { keys: ["G", "R"], label: "Go to Reports", group: "Navigation" },
  { keys: ["Esc"], label: "Close dialog / drawer", group: "General" },
];

const NAV_BY_LETTER: Record<string, string> = {
  d: "/dashboard",
  o: "/opportunities",
  p: "/projects",
  s: "/service",
  r: "/reports",
  c: "/catalog",
  i: "/inventory",
  a: "/accounts",
  b: "/billing",
  t: "/todos",
  k: "/calendar",
};

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

      // ⌘K / Ctrl+K — open AI assistant
      if (mod && (e.key === "k" || e.key === "K" || e.key === "/")) {
        e.preventDefault();
        showAssistant();
        return;
      }

      // Esc — close drawers (Sheet handles its own close, but help dialog)
      if (e.key === "Escape" && helpOpen) {
        setHelpOpen(false);
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
        const target = NAV_BY_LETTER[e.key.toLowerCase()];
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

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-aether-400 text-[11px] uppercase tracking-[0.2em]">
            <Keyboard className="h-3 w-3" />
            Keyboard shortcuts
          </div>
          <DialogTitle>Move at the speed of keys</DialogTitle>
          <DialogDescription>
            Every workflow has a chord. Press <Kbd>?</Kbd> anywhere to see this again.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {Array.from(new Set(SHORTCUTS.map((s) => s.group))).map((group) => (
            <div key={group}>
              <div className="text-[10px] uppercase tracking-wider text-white/45 mb-2">{group}</div>
              <div className="space-y-1">
                {SHORTCUTS.filter((s) => s.group === group).map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-white/80">{s.label}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, j) => (
                        <Kbd key={j}>{k}</Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-white/45">
            <Sparkles className="h-3 w-3 text-aether-400" />
            New here? Use the <Kbd>?</Kbd> key from anywhere to reopen this.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] text-[11px] font-mono text-white/85">
      {children}
    </kbd>
  );
}
