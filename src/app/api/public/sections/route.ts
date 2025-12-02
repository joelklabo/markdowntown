import { NextResponse } from "next/server";
import { listPublicSections } from "@/lib/publicSections";
import { cacheHeaders } from "@/config/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const start = performance.now();
  const sections = await listPublicSections(50);
  const headers = new Headers(cacheHeaders("browse", request.headers.get("cookie")));
  headers.set("Server-Timing", `app;dur=${(performance.now() - start).toFixed(1)}`);
  headers.set("x-cache-profile", "browse");
  return NextResponse.json(sections, { headers });
}
