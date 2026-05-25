import { AccountDetail } from "@/components/details/account-detail";
import { fetchAccount } from "@/lib/data/detail-fetchers";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await fetchAccount(id);
  return <AccountDetail account={account} />;
}
