"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  FolderKanban,
  Target,
  Building2,
  LifeBuoy,
  Receipt,
  ShoppingCart,
  Cpu,
  Layers3,
  BookOpen,
  User,
  Plus,
  X,
  Star,
  Clock,
  Command as CommandIcon,
} from "lucide-react";
import { searchWorkspace, type SearchResult, type SearchResultKind } from "@/app/actions/search";
import { useQuickCreate } from "@/lib/stores/quick-create";
import { useAssistant } from "@/lib/stores/assistant";
import { useDensity, type Density } from "@/lib/stores/density";
import { NAV_BY_HINT_LETTER, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Mode = "search" | "command" | "filter" | "people" | "money";

type Command = {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Search;
  run: () => void;
  keywords?: string[];
};

const KIND_ICON: Record<SearchResultKind, typeof Search> = {
  project: FolderKanban,
  opportunity: Target,
  account: Building2,
  ticket: LifeBuoy,
  invoice: Receipt,
  po: ShoppingCart,
  device: Cpu,
  room: Layers3,
  catalog: BookOpen,
  user: User,
};

const KIND_LABEL: Record<SearchResultKind, string> = {
  project: "Projects",
  opportunity: "Opportunities",
  account: "Accounts",
  ticket: "Tickets",
  invoice: "Invoices",
  po: "Purchase Orders",
  device: "Devices",
  room: "Rooms",
  catalog: "Catalog",
  user: "People",
};

const RECENT_KEY = "zynex.palette.recent";
const SAVED_KEY = "zynex.palette.saved";

type Saved = { id: string; query: string; label: string };

export function CommandPalette() {
  const router = useRouter();
  const showQuickCreate = useQuickCreate((s) => s.show);
  const showAssistant = useAssistant((s) => s.show);
  const setDensity = useDensity((s) => s.setDensity);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mode detection from query prefix
  const mode: Mode = useMemo(() => {
    if (query.startsWith(">")) return "command";
    if (query.startsWith("#")) return "filter";
    if (query.startsWith("@")) return "people";
    if (query.startsWith("$")) return "money";
    return "search";
  }, [query]);

  const stripped = useMemo(() => {
    if (mode === "search") return query;
    return query.slice(1).trim();
  }, [query, mode]);

  // ── Listen for ⌘K event ──
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener("zynex:open-palette", open);
    return () => window.removeEventListener("zynex:open-palette", open);
  }, []);

  // ── Hydrate recent + saved from localStorage ──
  useEffect(() => {
    try {
      const r = localStorage.getItem(RECENT_KEY);
      if (r) setRecent(JSON.parse(r));
      const s = localStorage.getItem(SAVED_KEY);
      if (s) setSaved(JSON.parse(s));
    } catch {
      /* ignore */
    }
  }, []);

  // ── Focus the input when opened ──
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setActiveIndex(0);
    } else {
      // Clear after close
      setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 150);
    }
  }, [open]);

  // ── Debounced search ──
  useEffect(() => {
    if (!open) return;
    if (mode === "command") {
      setResults([]);
      return;
    }
    const q = stripped;
    if (q.length < 1) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        const r = await searchWorkspace(q);
        setResults(r);
        setActiveIndex(0);
      });
    }, 140);
    return () => clearTimeout(handle);
  }, [stripped, mode, open]);

  // ── Command catalogue ──
  const commands: Command[] = useMemo(
    () => [
      {
        id: "ai.builder",
        label: "AI Builder · design a new room",
        hint: "G N",
        icon: Sparkles,
        run: () => {
          setOpen(false);
          router.push("/builder");
        },
        keywords: ["build", "wizard", "project", "ai", "new", "create"],
      },
      {
        id: "ai.ask",
        label: "Ask AI in current context",
        hint: "⌘/",
        icon: Sparkles,
        run: () => {
          setOpen(false);
          showAssistant();
        },
      },
      {
        id: "create.opportunity",
        label: "New opportunity",
        hint: "⇧O",
        icon: Plus,
        run: () => {
          setOpen(false);
          showQuickCreate("opportunity");
        },
      },
      {
        id: "create.project",
        label: "New project",
        hint: "⇧P",
        icon: Plus,
        run: () => {
          setOpen(false);
          showQuickCreate("project");
        },
      },
      {
        id: "create.ticket",
        label: "New service ticket",
        hint: "⇧T",
        icon: Plus,
        run: () => {
          setOpen(false);
          showQuickCreate("ticket");
        },
      },
      {
        id: "create.todo",
        label: "New task",
        hint: "⇧N",
        icon: Plus,
        run: () => {
          setOpen(false);
          showQuickCreate("todo");
        },
      },
      {
        id: "density.comfortable",
        label: "Switch density: Comfortable",
        icon: CommandIcon,
        run: () => {
          setDensity("comfortable" as Density);
          setOpen(false);
        },
      },
      {
        id: "density.compact",
        label: "Switch density: Compact",
        icon: CommandIcon,
        run: () => {
          setDensity("compact" as Density);
          setOpen(false);
        },
      },
      {
        id: "density.mission",
        label: "Switch density: Mission control",
        icon: CommandIcon,
        run: () => {
          setDensity("mission" as Density);
          setOpen(false);
        },
      },
      ...NAV_ITEMS.filter((n) => n.group !== "Workspace").map((n) => ({
        id: `nav.${n.href}`,
        label: `Go to ${n.label}`,
        hint: n.hint,
        icon: n.icon,
        run: () => {
          setOpen(false);
          router.push(n.href);
        },
        keywords: [n.label.toLowerCase(), n.group?.toLowerCase()].filter(Boolean) as string[],
      })),
    ],
    [router, setDensity, showAssistant, showQuickCreate]
  );

  const filteredCommands = useMemo(() => {
    if (mode !== "command") return [];
    const q = stripped.toLowerCase();
    if (!q) return commands.slice(0, 8);
    return commands
      .filter((c) => {
        if (c.label.toLowerCase().includes(q)) return true;
        return c.keywords?.some((k) => k.includes(q)) ?? false;
      })
      .slice(0, 10);
  }, [commands, stripped, mode]);

  // ── AI suggestion (deterministic for now) ──
  const aiSuggestion = useMemo(() => {
    if (mode !== "search" || stripped.length < 3) return null;
    return {
      label: `Summarise everything in this workspace about "${stripped}"`,
      run: () => {
        setOpen(false);
        showAssistant(
          `Give me a short workspace-wide brief on "${stripped}". Include relevant accounts, projects, recent tickets, and any risks.`
        );
      },
    };
  }, [mode, stripped, showAssistant]);

  // ── Group results by kind ──
  const grouped = useMemo(() => {
    const map: Record<string, SearchResult[]> = {};
    for (const r of results) {
      (map[r.kind] ??= []).push(r);
    }
    return map;
  }, [results]);

  // ── Flat list of actionable rows for keyboard nav ──
  type Row =
    | { kind: "ai"; run: () => void; label: string }
    | { kind: "result"; result: SearchResult }
    | { kind: "command"; command: Command }
    | { kind: "recent"; result: SearchResult }
    | { kind: "saved"; saved: Saved };

  const rows: Row[] = useMemo(() => {
    const arr: Row[] = [];
    if (aiSuggestion) arr.push({ kind: "ai", run: aiSuggestion.run, label: aiSuggestion.label });
    if (mode === "command") {
      for (const c of filteredCommands) arr.push({ kind: "command", command: c });
    } else if (stripped.length > 0) {
      for (const r of results) arr.push({ kind: "result", result: r });
    } else {
      for (const r of recent.slice(0, 6)) arr.push({ kind: "recent", result: r });
      for (const s of saved.slice(0, 6)) arr.push({ kind: "saved", saved: s });
    }
    return arr;
  }, [aiSuggestion, mode, filteredCommands, results, stripped, recent, saved]);

  // ── Keyboard nav ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(rows.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = rows[activeIndex];
        if (!row) return;
        runRow(row, e.metaKey || e.ctrlKey);
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        // ⌘S — save current search
        e.preventDefault();
        if (stripped.length > 0 && mode === "search") {
          const newSaved: Saved = {
            id: crypto.randomUUID(),
            query: stripped,
            label: stripped,
          };
          const next = [newSaved, ...saved.filter((s) => s.query !== stripped)].slice(0, 12);
          setSaved(next);
          localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        }
      }
    },
    [rows, activeIndex, stripped, mode, saved]
  );

  function runRow(row: Row, _newTab: boolean) {
    if (row.kind === "ai") {
      row.run();
      return;
    }
    if (row.kind === "command") {
      row.command.run();
      return;
    }
    const result =
      row.kind === "result" ? row.result : row.kind === "recent" ? row.result : null;
    if (result) {
      pushRecent(result);
      setOpen(false);
      router.push(result.href);
      return;
    }
    if (row.kind === "saved") {
      setQuery(row.saved.query);
    }
  }

  function pushRecent(r: SearchResult) {
    const next = [r, ...recent.filter((x) => x.id !== r.id || x.kind !== r.kind)].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  // ── Scroll active row into view ──
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-row-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let rowCursor = 0;
  const nextRowIndex = () => rowCursor++;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink-300/30 backdrop-blur-sm" aria-hidden />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[680px] rounded-lg bg-white border border-bone-300/65 shadow-[0_30px_80px_-20px_rgba(10,10,10,0.32)] overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-bone-300/55">
          <Search className="h-4 w-4 text-ink-300/45 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search… use > for commands, # for filters, @ for people, $ for money"
            className="flex-1 bg-transparent text-[14px] text-ink-300 placeholder:text-ink-300/40 outline-none"
          />
          {isPending && (
            <span className="text-[10px] font-mono text-ink-300/40">searching…</span>
          )}
          <button
            onClick={() => setOpen(false)}
            className="h-6 w-6 rounded text-ink-300/55 hover:text-ink-300 hover:bg-bone-100 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mode hint */}
        <ModeHint mode={mode} />

        {/* Results list */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-1.5">
          {/* AI suggestion */}
          {aiSuggestion && (
            <ResultGroup label="AI suggestions">
              <ResultRow
                index={nextRowIndex()}
                active={activeIndex === 0}
                icon={Sparkles}
                primary={aiSuggestion.label}
                accentSignal
                onClick={() => aiSuggestion.run()}
                onMouseEnter={(i) => setActiveIndex(i)}
              />
            </ResultGroup>
          )}

          {/* Commands */}
          {mode === "command" && filteredCommands.length > 0 && (
            <ResultGroup label="Commands">
              {filteredCommands.map((c) => {
                const Icon = c.icon;
                const i = nextRowIndex();
                return (
                  <ResultRow
                    key={c.id}
                    index={i}
                    active={activeIndex === i}
                    icon={Icon}
                    primary={c.label}
                    trailing={c.hint && <span className="kbd">{c.hint}</span>}
                    onClick={() => c.run()}
                    onMouseEnter={(i) => setActiveIndex(i)}
                  />
                );
              })}
            </ResultGroup>
          )}

          {/* Grouped search results */}
          {stripped.length > 0 &&
            mode !== "command" &&
            Object.keys(grouped).map((kind) => {
              const k = kind as SearchResultKind;
              const Icon = KIND_ICON[k];
              return (
                <ResultGroup key={kind} label={KIND_LABEL[k]}>
                  {grouped[kind].map((r) => {
                    const i = nextRowIndex();
                    return (
                      <ResultRow
                        key={`${r.kind}-${r.id}`}
                        index={i}
                        active={activeIndex === i}
                        icon={Icon}
                        primary={r.title}
                        secondary={r.meta}
                        trailing={r.badge && <span className="kbd">{r.badge}</span>}
                        onClick={() => {
                          pushRecent(r);
                          setOpen(false);
                          router.push(r.href);
                        }}
                        onMouseEnter={(i) => setActiveIndex(i)}
                      />
                    );
                  })}
                </ResultGroup>
              );
            })}

          {/* Empty state — show recent + saved when no query */}
          {stripped.length === 0 && mode !== "command" && (
            <>
              {recent.length > 0 && (
                <ResultGroup label="Recent" icon={Clock}>
                  {recent.slice(0, 6).map((r) => {
                    const i = nextRowIndex();
                    const Icon = KIND_ICON[r.kind];
                    return (
                      <ResultRow
                        key={`recent-${r.kind}-${r.id}`}
                        index={i}
                        active={activeIndex === i}
                        icon={Icon}
                        primary={r.title}
                        secondary={r.meta}
                        onClick={() => {
                          setOpen(false);
                          router.push(r.href);
                        }}
                        onMouseEnter={(i) => setActiveIndex(i)}
                      />
                    );
                  })}
                </ResultGroup>
              )}
              {saved.length > 0 && (
                <ResultGroup label="Saved searches" icon={Star}>
                  {saved.slice(0, 6).map((s) => {
                    const i = nextRowIndex();
                    return (
                      <ResultRow
                        key={`saved-${s.id}`}
                        index={i}
                        active={activeIndex === i}
                        icon={Star}
                        primary={s.label}
                        onClick={() => setQuery(s.query)}
                        onMouseEnter={(i) => setActiveIndex(i)}
                      />
                    );
                  })}
                </ResultGroup>
              )}
              {recent.length === 0 && saved.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <CommandIcon className="h-5 w-5 mx-auto text-ink-300/35 mb-2" />
                  <p className="text-[13px] text-ink-300/55">
                    Search projects, accounts, tickets, devices, anything.
                  </p>
                  <p className="text-[12px] text-ink-300/40 mt-1">
                    Try <span className="kbd mx-0.5">{">"}</span> for commands.
                  </p>
                </div>
              )}
            </>
          )}

          {/* No results */}
          {stripped.length > 0 &&
            mode !== "command" &&
            Object.keys(grouped).length === 0 &&
            !isPending && (
              <div className="px-4 py-12 text-center">
                <p className="text-[13px] text-ink-300/55">No matches for "{stripped}".</p>
                <p className="text-[12px] text-ink-300/40 mt-1">
                  Press <span className="kbd mx-0.5">↵</span> to ask AI.
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-3 py-2 border-t border-bone-300/55 bg-bone-50/60 text-[10.5px] text-ink-300/55">
          <span className="inline-flex items-center gap-1">
            <span className="kbd"><ArrowUp className="h-2.5 w-2.5" /></span>
            <span className="kbd"><ArrowDown className="h-2.5 w-2.5" /></span>
            navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="kbd"><CornerDownLeft className="h-2.5 w-2.5" /></span>
            open
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="kbd">⌘S</span>
            save search
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <span className="kbd">esc</span>
            close
          </span>
        </div>
      </div>
    </div>
  );
}

function ModeHint({ mode }: { mode: Mode }) {
  if (mode === "search") return null;
  const labels: Record<Mode, string> = {
    search: "",
    command: "Commands · run an action",
    filter: "Filters · narrow by entity",
    people: "People · find a teammate",
    money: "Money · invoices, POs, deals",
  };
  return (
    <div className="px-3 py-1.5 border-b border-bone-300/45 bg-signal-500/5 text-[11px] text-signal-700 font-medium">
      {labels[mode]}
    </div>
  );
}

function ResultGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Search;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <div className="px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-300/45 font-semibold flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({
  index,
  active,
  icon: Icon,
  primary,
  secondary,
  trailing,
  accentSignal,
  onClick,
  onMouseEnter,
}: {
  index: number;
  active: boolean;
  icon: typeof Search;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  trailing?: React.ReactNode;
  accentSignal?: boolean;
  onClick: () => void;
  onMouseEnter: (i: number) => void;
}) {
  return (
    <div
      data-row-index={index}
      onClick={onClick}
      onMouseEnter={() => onMouseEnter(index)}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[13px]",
        active ? "bg-bone-100" : "hover:bg-bone-50"
      )}
    >
      <span
        className={cn(
          "h-6 w-6 rounded flex items-center justify-center shrink-0",
          accentSignal
            ? "bg-signal-500/10 text-signal-600"
            : "bg-bone-50 border border-bone-300/55 text-ink-300/70"
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-ink-300 truncate">{primary}</div>
        {secondary && (
          <div className="text-[11px] text-ink-300/55 truncate mt-0.5">{secondary}</div>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
