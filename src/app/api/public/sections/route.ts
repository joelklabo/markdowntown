import { NextResponse } from "next/server";
import { listPublicSections } from "@/lib/publicSections";

export const dynamic = "force-dynamic";

export async function GET() {
  const sections = await listPublicSections(50);
  return NextResponse.json(sections);
}
