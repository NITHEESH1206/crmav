"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Sparkles, Check, Loader2 } from "lucide-react";
import { TEMPLATES, TRIGGERS, ACTIONS } from "@/lib/automations/catalog";
import { installTemplate } from "@/app/actions/automations";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TemplateGallery({ installedIds = [] }: { installedIds?: string[] }) {
  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));
  const installed = new Set(installedIds);

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = TEMPLATES.filter((t) => t.category === cat);
        return (
          <section key={cat}>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-semibold mb-2">
              {cat}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((t) => (
                <TemplateCard key={t.id} template={t} installed={installed.has(t.id)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TemplateCard({
  template,
  installed,
}: {
  template: (typeof TEMPLATES)[number];
  installed: boolean;
}) {
  const trigger = TRIGGERS.find((tr) => tr.id === template.trigger);
  const TriggerIcon = trigger?.icon ?? Sparkles;
  const [isInstalled, setInstalled] = useState(installed);
  const [pending, startTransition] = useTransition();

  function install() {
    startTransition(async () => {
      const r = await installTemplate({ templateId: template.id });
      if (r.ok) {
        setInstalled(true);
        toast.success(`Installed "${template.name}"`, {
          description: "Now active. Switch to the Active tab and hit Run now to test it.",
        });
      } else {
        toast.error(r.error || "Couldn't install");
        if (r.error === "Already installed") setInstalled(true);
      }
    });
  }

  return (
    <article className="glass-card p-4 flex flex-col gap-3">
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
        {isInstalled ? (
          <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-status-success-bg/70 border border-status-success-fg/25 text-[12px] font-medium text-status-success-fg">
            <Check className="h-3 w-3" strokeWidth={2.5} />
            Installed
          </span>
        ) : (
          <button
            type="button"
            onClick={install}
            disabled={pending}
            className="btn-glass-primary inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Install
          </button>
        )}
      </footer>
    </article>
  );
}
