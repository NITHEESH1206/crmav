import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    items: [
      { id: "D-204", name: "Soho HQ — Phase 1", stage: "DISCOVERY", valueCents: 18_400_000, aiScore: 72 },
      { id: "D-199", name: "Convention center AV", stage: "PROPOSAL", valueCents: 41_200_000, aiScore: 84 },
      { id: "D-194", name: "Hilton restaurant AV", stage: "NEGOTIATION", valueCents: 28_000_000, aiScore: 88 },
    ],
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, received: body }, { status: 201 });
}
