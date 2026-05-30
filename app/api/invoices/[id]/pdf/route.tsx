import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument, type InvoicePdfData } from "@/lib/pdf/invoice-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Streams a branded invoice PDF.
 *
 * GET /api/invoices/[id]/pdf            → app-side download (workspace-scoped)
 * GET /api/invoices/[id]/pdf?account=X  → portal download (account-scoped auth)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const fromAccount = url.searchParams.get("account");

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: true,
      account: { include: { contacts: { where: { isPrimary: true }, take: 1 } } },
      workspace: { select: { name: true, currency: true } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Portal auth: invoice must belong to the requesting account
  if (fromAccount && invoice.accountId !== fromAccount) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fmt = (d: Date | null) =>
    d
      ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : null;

  const primary = invoice.account?.contacts[0];
  const subtotalCents = invoice.totalCents - invoice.taxCents;

  const data: InvoicePdfData = {
    workspaceName: invoice.workspace.name,
    workspaceCurrency: invoice.workspace.currency ?? "USD",
    number: invoice.number,
    status: invoice.status,
    issuedAt: fmt(invoice.issuedAt),
    dueAt: fmt(invoice.dueAt),
    paidAt: fmt(invoice.paidAt),
    accountName: invoice.account?.name ?? "—",
    accountContact: primary
      ? { name: `${primary.firstName} ${primary.lastName}`.trim(), email: primary.email }
      : null,
    lines: invoice.lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
    })),
    subtotalCents,
    taxCents: invoice.taxCents,
    totalCents: invoice.totalCents,
  };

  try {
    const buffer = await renderToBuffer(<InvoiceDocument data={data} />);
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF generation failed" },
      { status: 500 }
    );
  }
}
