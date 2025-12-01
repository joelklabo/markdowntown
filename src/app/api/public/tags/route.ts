import { NextResponse } from "next/server";
import { listTopTags } from "@/lib/publicTags";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const res = NextResponse.json(tags);
  res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  return res;
}
