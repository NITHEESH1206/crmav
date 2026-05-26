import { ModuleShell } from "@/components/app/module-shell";
import { CalendarWeekView } from "@/components/calendar/calendar-week-view";
import { getWeekEvents } from "@/lib/data/calendar";

export default async function CalendarPage() {
  const events = await getWeekEvents();

  return (
    <ModuleShell
      eyebrow="Calendar"
      title="Schedule"
      description="Drag events to move, drag the bottom edge to resize, click any empty slot to create. Live to Neon."
    >
      <CalendarWeekView initialEvents={events} />
    </ModuleShell>
  );
}
