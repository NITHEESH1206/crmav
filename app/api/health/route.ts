import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "aetherav-crm",
    time: new Date().toISOString(),
  });
}
