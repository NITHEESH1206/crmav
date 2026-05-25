import { OpportunityDetail } from "@/components/details/opportunity-detail";
import { fetchOpportunity, getWorkspaceUsers } from "@/lib/data/detail-fetchers";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [opp, users] = await Promise.all([fetchOpportunity(id), getWorkspaceUsers()]);
  return <OpportunityDetail opp={opp} users={users} />;
}
