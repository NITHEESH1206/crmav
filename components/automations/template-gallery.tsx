"use client";

import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";
import { TEMPLATES, TRIGGERS, ACTIONS } from "@/lib/automations/catalog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TemplateGallery() {
  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = TEMPLATES.filter((t) => t.category === cat);
        return (
          <section key={cat}>
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold mb-2">
              {cat}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TemplateCard({ template }: { template: (typeof TEMPLATES)[number] }) {
  const trigger = TRIGGERS.find((tr) => tr.id === template.trigger);
  const TriggerIcon = trigger?.icon ?? Sparkles;

  return (
    <article className="rounded-lg bg-white border border-bone-300/55 p-4 flex flex-col gap-3 hover:border-bone-300/85 transition-colors">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[13.5px] font-semibold text-ink-300">{template.name}</h3>
          <p className="text-[12px] text-ink-300/65 mt-1 leading-relaxed">
            {template.description}
          </p>
        </div>
      </header>

      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
        <Badge variant="neutral" className="gap-1">
          <TriggerIcon className="h-2.5 w-2.5" />
          {trigger?.label ?? template.trigger}
        </Badge>
        {template.conditions.length > 0 && (
          <Badge variant="filter">
            +{template.conditions.length} condition{template.conditions.length === 1 ? "" : "s"}
          </Badge>
        )}
        {template.actions.map((a, i) => {
          const action = ACTIONS.find((ax) => ax.id === a.id);
          const ActionIcon = action?.icon ?? Plus;
          return (
            <Badge key={i} variant="filter" className={cn("gap-1")}>
              <ActionIcon className="h-2.5 w-2.5" />
              {action?.label ?? a.id}
            </Badge>
          );
        })}
      </div>

      <footer className="flex items-center justify-end gap-2 mt-1">
        <button
          type="button"
          className="text-[12px] text-ink-300/65 hover:text-ink-300 font-medium"
          onClick={() => toast.info("Preview", { description: "Visual editor opens in a follow-up." })}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() =>
            toast.success(`Installed "${template.name}"`, {
              description: "Active in your workspace once the job runner ships.",
            })
          }
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink-300 text-bone-100 text-[12px] font-medium hover:bg-ink-200"
        >
          <Plus className="h-3 w-3" />
          Install
        </button>
      </footer>
    </article>
  );
}
