import { ModuleShell } from "@/components/app/module-shell";
import { CalendarWeekView } from "@/components/calendar/calendar-week-view";
import { MobileCalendar } from "@/components/calendar/mobile-calendar";
import { getWeekEvents } from "@/lib/data/calendar";

export default async function CalendarPage() {
  const events = await getWeekEvents();

  return (
    <ModuleShell
      eyebrow="Calendar"
      title="Schedule"
      description="Drag events to move, drag the bottom edge to resize, click any empty slot to create."
    >
      {/* Mobile: vertical day list */}
      <div className="md:hidden">
        <MobileCalendar events={events} />
      </div>
      {/* Desktop & tablet: full week grid */}
      <div className="hidden md:block">
        <CalendarWeekView initialEvents={events} />
      </div>
    </ModuleShell>
  );
}
