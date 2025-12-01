import { NextResponse } from "next/server";
import { listSpotlightTags } from "@/lib/publicTags";

export const revalidate = 600;

export async function GET() {
  const tags = await listSpotlightTags(20);
  const res = NextResponse.json(tags);
  res.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=900");
  return res;
}
