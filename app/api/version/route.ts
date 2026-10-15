import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version || "local";
  return NextResponse.json(
    { version },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
