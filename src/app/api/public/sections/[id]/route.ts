import { NextResponse } from "next/server";
import { getPublicSection } from "@/lib/publicSections";
import { cacheHeaders } from "@/config/cache";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: RouteContext) {
  const start = performance.now();
  const { id } = await context.params;
  const section = await getPublicSection(id);
  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const headers = new Headers(cacheHeaders("detail", request.headers.get("cookie")));
  headers.set("Server-Timing", `app;dur=${(performance.now() - start).toFixed(1)}`);
  headers.set("x-cache-profile", "detail");
  return NextResponse.json(section, { headers });
}
