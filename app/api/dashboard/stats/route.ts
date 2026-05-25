import { NextResponse } from "next/server";

// Sample dashboard stats. Swap with `prisma` queries once the DB is provisioned.
export async function GET() {
  return NextResponse.json({
    revenueMtdCents: 142_000_000,
    activeProjects: 47,
    openTickets: 12,
    pipelineCents: 382_000_000,
    technicianUtilization: 84.4,
    updatedAt: new Date().toISOString(),
  });
}
