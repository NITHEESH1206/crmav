import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { ProjectStatus } from "@/components/dashboard/project-status";
import { ServiceTickets } from "@/components/dashboard/service-tickets";
import { TechnicianTracking } from "@/components/dashboard/technician-tracking";
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  getDashboardStats,
  getActivityFeed,
  getPipelineByStage,
  getActiveProjects,
  getOpenTickets,
  getTechnicians,
  getUpcomingEvents,
} from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const [stats, activity, pipeline, projects, tickets, techs, events] = await Promise.all([
    getDashboardStats(),
    getActivityFeed(),
    getPipelineByStage(),
    getActiveProjects(4),
    getOpenTickets(4),
    getTechnicians(),
    getUpcomingEvents(),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <KpiCards
        revenueCents={stats.revenueMtdCents}
        activeProjects={stats.activeProjects}
        openTickets={stats.openTickets}
        pipelineCents={stats.pipelineCents}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RevenueChart />
        <PipelineFunnel stages={pipeline} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ProjectStatus projects={projects} totalActive={stats.activeProjects} />
        <ServiceTickets tickets={tickets} />
        <TechnicianTracking techs={techs} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <UpcomingMeetings events={events} />
        <ActivityTimeline items={activity} />
      </div>
    </div>
  );
}
