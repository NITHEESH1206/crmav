"use client";

import { useState, useTransition } from "react";
import { Mail, Bell, Check } from "lucide-react";
import { toast } from "sonner";
import {
  NOTIFICATION_EVENTS,
  updateNotificationPref,
  type NotificationPrefs,
} from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

export function NotificationsTab({ initial }: { initial: NotificationPrefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [, startTransition] = useTransition();

  function toggle(eventKey: string, channel: "email" | "inApp") {
    const enabled = !prefs[eventKey][channel];
    // Optimistic update
    setPrefs((p) => ({
      ...p,
      [eventKey]: { ...p[eventKey], [channel]: enabled },
    }));
    startTransition(async () => {
      try {
        await updateNotificationPref({ eventKey, channel, enabled });
      } catch {
        // Revert on failure
        setPrefs((p) => ({
          ...p,
          [eventKey]: { ...p[eventKey], [channel]: !enabled },
        }));
        toast.error("Couldn't save preference");
      }
    });
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-bone-300/35 flex items-center justify-between">
        <h3 className="text-[14px] font-medium text-ink-300">Notification channels</h3>
        <div className="flex items-center gap-5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55">
          <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email</span>
          <span className="inline-flex items-center gap-1.5"><Bell className="h-3 w-3" /> In-app</span>
        </div>
      </div>
      <ul className="divide-y divide-bone-300/25">
        {NOTIFICATION_EVENTS.map((ev) => (
          <li key={ev.key} className="px-5 py-3 flex items-center justify-between gap-4">
            <span className="text-[13.5px] text-ink-300/85">{ev.label}</span>
            <div className="flex items-center gap-5 shrink-0">
              <Toggle
                on={prefs[ev.key]?.email ?? false}
                onClick={() => toggle(ev.key, "email")}
                ariaLabel={`Email for ${ev.label}`}
              />
              <Toggle
                on={prefs[ev.key]?.inApp ?? false}
                onClick={() => toggle(ev.key, "inApp")}
                ariaLabel={`In-app for ${ev.label}`}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="px-5 py-2.5 border-t border-bone-300/35 bg-white/30 text-[11px] text-ink-300/55">
        Changes save instantly. These drive which events reach you once the notification dispatcher and automations runner are live.
      </div>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  ariaLabel,
}: {
  on: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors shrink-0 border",
        on
          ? "bg-signal-500/90 border-signal-600/40"
          : "bg-bone-200/80 border-bone-300/60"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_2px_rgba(10,10,10,0.2)] transition-all flex items-center justify-center",
          on ? "left-[18px]" : "left-0.5"
        )}
      >
        {on && <Check className="h-2 w-2 text-signal-700" strokeWidth={3} />}
      </span>
    </button>
  );
}
