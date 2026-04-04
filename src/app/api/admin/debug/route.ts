import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasEmail: !!process.env.ADMIN_EMAILS,
    hasPassword: !!process.env.ADMIN_PASSWORD,
    // Never log actual values in production — debug only
    emailFirstChar: process.env.ADMIN_EMAILS?.[0] ?? "MISSING",
  });
}
