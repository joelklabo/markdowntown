import { NextResponse } from "next/server";
import { listTopTags } from "@/lib/publicTags";
import { cacheHeaders } from "@/config/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const start = performance.now();
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const windowParam = searchParams.get("window");

  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100);
  const windowDays =
    windowParam === null
      ? null
      : windowParam === "all"
        ? null
        : Number(windowParam.replace("d", "")) || null;

  const tags = await listTopTags(limit, windowDays);

  const headers = new Headers(cacheHeaders("browse", request.headers.get("cookie")));
  headers.set("Server-Timing", `app;dur=${(performance.now() - start).toFixed(1)}`);
  headers.set("x-cache-profile", "browse");

  return NextResponse.json(tags, { headers });
}
