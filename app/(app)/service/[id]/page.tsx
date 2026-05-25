import { TicketDetail } from "@/components/details/ticket-detail";
import { fetchTicket, getWorkspaceUsers } from "@/lib/data/detail-fetchers";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ticket, users] = await Promise.all([fetchTicket(id), getWorkspaceUsers()]);
  return <TicketDetail ticket={ticket} users={users} />;
}
