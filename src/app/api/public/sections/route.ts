import { NextResponse } from "next/server";
import { listPublicSections } from "@/lib/publicSections";
import { cacheHeaders } from "@/config/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const sections = await listPublicSections(50);
  return NextResponse.json(sections, { headers: cacheHeaders("browse") });
}
