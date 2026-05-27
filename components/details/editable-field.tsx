"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  className?: string;
};

// ─── Editable text/number/date ────────────────────────────────────────────

type FieldKind = "text" | "number" | "date" | "money";

export function EditableField({
  label,
  value,
  kind = "text",
  onSave,
  displayValue,
  className,
}: BaseProps & {
  value: string | number | null | undefined;
  kind?: FieldKind;
  onSave: (next: string) => Promise<unknown>;
  displayValue?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stringify(value));
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(stringify(value));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, value]);

  function commit() {
    setErr(null);
    startTransition(async () => {
      try {
        await onSave(draft);
        setEditing(false);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  return (
    <div className={cn("group", className)}>
      <div className="text-[10px] uppercase tracking-wider text-ink-300/50">{label}</div>
      <AnimatePresence mode="wait" initial={false}>
        {!editing ? (
          <motion.button
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(true)}
            className="mt-1 flex items-center gap-2 -ml-1 px-1 py-0.5 rounded text-sm text-ink-300/90 hover:bg-bone-100/70 transition-colors w-full text-left"
          >
            <span className="truncate">{displayValue ?? (stringify(value) || "—")}</span>
            <Pencil className="h-3 w-3 text-ink-300/45 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
          </motion.button>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1 flex items-center gap-1"
          >
            <input
              ref={inputRef}
              type={kind === "money" || kind === "number" ? "number" : kind}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="h-7 flex-1 rounded-md border border-signal-500/40 bg-bone-100/70 px-2 text-sm text-ink-300 focus:outline-none focus:ring-2 focus:ring-signal-500/20"
            />
            <button
              onClick={commit}
              disabled={isPending}
              className="h-7 w-7 rounded-md bg-signal-500 text-ink-300 flex items-center justify-center hover:bg-signal-400 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="h-7 w-7 rounded-md border border-bone-300/65 text-ink-300/65 flex items-center justify-center hover:text-ink-300 hover:bg-bone-100/70"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {err && <div className="text-[11px] text-red-400 mt-1">{err}</div>}
    </div>
  );
}

function stringify(v: string | number | null | undefined): string {
  if (v == null) return "";
  return String(v);
}

// ─── Editable select ──────────────────────────────────────────────────────

export function EditableSelect({
  label,
  value,
  options,
  onSave,
  className,
}: BaseProps & {
  value: string | null | undefined;
  options: { value: string; label: string }[];
  onSave: (next: string) => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (editing) setDraft(value ?? "");
  }, [editing, value]);

  function commit(next: string) {
    setDraft(next);
    startTransition(async () => {
      await onSave(next);
      setEditing(false);
    });
  }

  const current = options.find((o) => o.value === value);

  return (
    <div className={cn("group", className)}>
      <div className="text-[10px] uppercase tracking-wider text-ink-300/50">{label}</div>
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="mt-1 flex items-center gap-2 -ml-1 px-1 py-0.5 rounded text-sm text-ink-300/90 hover:bg-bone-100/70 transition-colors w-full text-left"
        >
          <span className="truncate">{current?.label ?? "—"}</span>
          <Pencil className="h-3 w-3 text-ink-300/45 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
        </button>
      ) : (
        <select
          autoFocus
          value={draft}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => setEditing(false)}
          disabled={isPending}
          className="mt-1 h-7 w-full rounded-md border border-signal-500/40 bg-white px-2 text-sm text-ink-300 focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
