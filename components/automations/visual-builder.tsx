"use client";

import { useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { TRIGGERS, ACTIONS, type TriggerId, type ActionId } from "@/lib/automations/catalog";
import { cn } from "@/lib/utils";

type Condition = { field: string; op: string; value: string };

/**
 * Visual builder — three columns: Trigger → Conditions → Actions.
 * State-only; persistence wires up alongside the job runner.
 */
export function VisualBuilder() {
  const [trigger, setTrigger] = useState<TriggerId | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<ActionId[]>([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_24px_1fr_24px_1fr] gap-3 items-start">
      <Column label="Trigger" hint="When this happens…">
        {trigger ? (
          <ChosenChip onClear={() => setTrigger(null)}>
            {TRIGGERS.find((t) => t.id === trigger)?.label}
          </ChosenChip>
        ) : (
          <ListPicker
            options={TRIGGERS.map((t) => ({ id: t.id, label: t.label, hint: t.category }))}
            onPick={(id) => setTrigger(id as TriggerId)}
            cap={6}
          />
        )}
      </Column>

      <Arrow />

      <Column label="Conditions" hint="…and these are true…">
        <div className="space-y-1.5">
          {conditions.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-1 text-[12px] bg-bone-50 border border-bone-300/55 rounded-md px-2 py-1.5"
            >
              <span className="text-ink-300 font-medium">{c.field}</span>
              <span className="text-ink-300/55">{c.op}</span>
              <span className="text-ink-300">{c.value}</span>
              <button
                type="button"
                onClick={() =>
                  setConditions((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="ml-auto text-ink-300/45 hover:text-ink-300"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setConditions((prev) => [
                ...prev,
                { field: "priority", op: "is", value: "P1" },
              ])
            }
            className="w-full inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-dashed border-bone-300/75 text-[12px] text-ink-300/55 hover:text-ink-300 hover:border-bone-300"
          >
            <Plus className="h-3 w-3" />
            Add condition
          </button>
        </div>
      </Column>

      <Arrow />

      <Column label="Actions" hint="…do these things.">
        <div className="space-y-1.5">
          {actions.map((id, i) => {
            const a = ACTIONS.find((ax) => ax.id === id);
            const Icon = a?.icon ?? Plus;
            return (
              <div
                key={i}
                className="flex items-center gap-2 text-[12px] bg-bone-50 border border-bone-300/55 rounded-md px-2 py-1.5"
              >
                <Icon className="h-3 w-3 text-ink-300/65 shrink-0" />
                <span className="text-ink-300 truncate">{a?.label}</span>
                <button
                  type="button"
                  onClick={() => setActions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="ml-auto text-ink-300/45 hover:text-ink-300"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          <ListPicker
            options={ACTIONS.map((a) => ({ id: a.id, label: a.label, hint: a.category }))}
            onPick={(id) => setActions((prev) => [...prev, id as ActionId])}
            cap={6}
            inline
            placeholder="Add action"
          />
        </div>
      </Column>
    </div>
  );
}

function Column({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
      <header className="px-3 py-2 border-b border-bone-300/45">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
          {label}
        </div>
        <div className="text-[11px] text-ink-300/55 mt-0.5">{hint}</div>
      </header>
      <div className="p-2.5 min-h-[220px]">{children}</div>
    </section>
  );
}

function Arrow() {
  return (
    <div className="hidden lg:flex items-center justify-center pt-12">
      <ArrowRight className="h-3.5 w-3.5 text-ink-300/40" />
    </div>
  );
}

function ChosenChip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-[12.5px] bg-ink-300 text-bone-100 rounded-md px-2.5 py-1.5">
      <span className="flex-1 truncate">{children}</span>
      <button
        type="button"
        onClick={onClear}
        className="text-bone-100/75 hover:text-bone-100"
        aria-label="Change"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function ListPicker({
  options,
  onPick,
  cap,
  inline,
  placeholder,
}: {
  options: { id: string; label: string; hint?: string }[];
  onPick: (id: string) => void;
  cap?: number;
  inline?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = options.filter((o) =>
    q ? o.label.toLowerCase().includes(q.toLowerCase()) : true
  );

  if (inline && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-dashed border-bone-300/75 text-[12px] text-ink-300/55 hover:text-ink-300 hover:border-bone-300"
      >
        <Plus className="h-3 w-3" />
        {placeholder ?? "Pick"}
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <input
        autoFocus={inline}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter…"
        className="h-8 w-full rounded-md border border-bone-300/55 bg-bone-50 px-2.5 text-[12.5px] text-ink-300 placeholder:text-ink-300/40 outline-none focus:border-ink-300/30"
      />
      <ul className="space-y-0.5 max-h-[260px] overflow-y-auto">
        {filtered.slice(0, cap ?? 20).map((o) => (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => {
                onPick(o.id);
                setOpen(false);
                setQ("");
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] text-left",
                "hover:bg-bone-100 text-ink-300/85 hover:text-ink-300"
              )}
            >
              <span className="flex-1 truncate">{o.label}</span>
              {o.hint && (
                <span className="text-[10.5px] text-ink-300/45 uppercase tracking-wider">
                  {o.hint}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
