import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ZynexAV-crm",
    time: new Date().toISOString(),
  });
}
