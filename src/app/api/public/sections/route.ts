import { NextResponse } from "next/server";
import { listPublicSections } from "@/lib/publicSections";

export const revalidate = 30; // lightweight ISR for public list

export async function GET() {
  const sections = await listPublicSections(50);
  return NextResponse.json(sections);
}
