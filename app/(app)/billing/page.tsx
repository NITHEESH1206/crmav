import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, CheckCircle2 } from "lucide-react";
import { formatCompact, formatDate } from "@/lib/utils";
import { listInvoices, listSubscriptions, billingSummary } from "@/lib/data/billing";

const statusVariant = (s: string) =>
  s === "PAID" ? ("success" as const) : s === "OVERDUE" ? ("destructive" as const) : ("secondary" as const);

export default async function BillingPage() {
  const [invoices, subs, summary] = await Promise.all([listInvoices(), listSubscriptions(), billingSummary()]);

  const stats = [
    { l: "Outstanding", v: `$${formatCompact(summary.outstandingCents / 100)}`, sub: `${summary.outstandingCount} invoices` },
    { l: "Collected", v: `$${formatCompact(summary.collectedCents / 100)}`, sub: "Lifetime" },
    { l: "Recurring MRR", v: `$${formatCompact(summary.mrrCents / 100)}`, sub: `${summary.amcCount} AMCs` },
    { l: "DSO (days)", v: "26.4", sub: "Trailing 90d" },
  ];

  const exportRows = invoices.map((inv) => ({
    number: inv.number,
    account: inv.account?.name ?? "",
    status: inv.status,
    total_usd: (inv.totalCents / 100).toFixed(2),
    tax_usd: (inv.taxCents / 100).toFixed(2),
    issued_at: inv.issuedAt ? inv.issuedAt.toISOString().slice(0, 10) : "",
    due_at: inv.dueAt ? inv.dueAt.toISOString().slice(0, 10) : "",
    paid_at: inv.paidAt ? inv.paidAt.toISOString().slice(0, 10) : "",
  }));

  return (
    <ModuleShell
      eyebrow="Billing"
      title="Invoices & Subscriptions"
      description="Recurring billing, AMC contracts, Stripe payments, multi-currency support."
      exportConfig={{
        filenamePrefix: "invoices",
        rows: exportRows,
        columns: [
          { key: "number", header: "Invoice #" },
          { key: "account", header: "Account" },
          { key: "status", header: "Status" },
          { key: "total_usd", header: "Total (USD)" },
          { key: "tax_usd", header: "Tax (USD)" },
          { key: "issued_at", header: "Issued" },
          { key: "due_at", header: "Due" },
          { key: "paid_at", header: "Paid" },
        ],
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.l}>
            <CardContent className="p-5">
              <div className="text-xs text-ink-300/55">{s.l}</div>
              <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.v}</div>
              <div className="text-[11px] text-ink-300/45 mt-1">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        <Card>
          <CardHeader><CardTitle>Recent invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-[100px_2fr_120px_140px_100px] text-[10px] uppercase tracking-wider text-ink-300/50 px-5 py-3 border-y border-bone-300/45">
              <div>Invoice</div>
              <div>Client</div>
              <div>Amount</div>
              <div>Due</div>
              <div>Status</div>
            </div>
            {invoices.map((inv) => (
              <div key={inv.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[100px_2fr_120px_140px_100px] items-start md:items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 border-b border-bone-300/45 hover:bg-bone-50/50 cursor-pointer">
                <div className="hidden md:block text-[11px] text-ink-300/50 font-mono">{inv.number}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{inv.account?.name ?? "—"}</div>
                  <div className="md:hidden mt-1 flex flex-wrap items-center gap-x-2 text-[11px]">
                    <span className="text-ink-300/50 font-mono">{inv.number}</span>
                    <span className="text-ink-300/65 font-mono">${formatCompact(inv.totalCents / 100)}</span>
                    {inv.dueAt && (
                      <span className="text-ink-300/50">· due {formatDate(inv.dueAt, { month: "short", day: "numeric" })}</span>
                    )}
                  </div>
                </div>
                <div className="hidden md:block text-sm font-mono">${formatCompact(inv.totalCents / 100)}</div>
                <div className="hidden md:block text-xs text-ink-300/65">
                  {inv.dueAt ? formatDate(inv.dueAt, { month: "short", day: "numeric" }) : "—"}
                </div>
                <Badge variant={statusVariant(inv.status)} className="capitalize self-start md:self-center">
                  {inv.status.toLowerCase()}
                </Badge>
              </div>
            ))}
            {invoices.length === 0 && <div className="px-5 py-8 text-center text-xs text-ink-300/50">No invoices yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscriptions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {subs.map((s) => (
              <div key={s.id} className="rounded-xl border border-bone-300/55 bg-bone-50/60 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium truncate">{s.account.name}</div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                </div>
                <div className="text-[11px] text-ink-300/55 mt-0.5">{s.plan}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-mono text-gradient">${(s.monthlyCents / 100).toLocaleString()}/mo</div>
                  <div className="flex items-center gap-1 text-[11px] text-ink-300/55">
                    <RefreshCcw className="h-3 w-3" />
                    {s.renewsAt ? formatDate(s.renewsAt, { month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>
              </div>
            ))}
            {subs.length === 0 && <div className="text-xs text-ink-300/50">No subscriptions.</div>}
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  );
}
