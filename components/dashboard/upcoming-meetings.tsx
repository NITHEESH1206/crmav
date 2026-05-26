"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MapPin, Phone, ChevronRight, type LucideIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  eventType: "MEETING" | "SITE_VISIT" | "INSTALL" | "AMC_VISIT" | "TASK";
};

const ICONS: Record<Event["eventType"], LucideIcon> = {
  MEETING: Video,
  SITE_VISIT: MapPin,
  INSTALL: MapPin,
  AMC_VISIT: MapPin,
  TASK: Phone,
};

export function UpcomingMeetings({ events }: { events: Event[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Upcoming events</CardTitle>
          <p className="text-xs text-white/45 mt-1">
            {events.length} scheduled
          </p>
        </div>
        <button className="text-xs text-signal-400 hover:text-signal-300 flex items-center gap-1">
          View calendar <ChevronRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 && (
          <div className="text-xs text-white/40 text-center py-8">Nothing scheduled.</div>
        )}
        {events.map((m, i) => {
          const Icon = ICONS[m.eventType];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-signal-500/15 to-transparent border border-signal-500/20 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-signal-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{m.title}</div>
                <div className="text-[11px] text-white/45 mt-0.5">
                  {formatDate(m.startsAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  {m.location && ` · ${m.location}`}
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
