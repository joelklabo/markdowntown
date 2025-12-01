import { NextResponse } from "next/server";
import { getPublicSection } from "@/lib/publicSections";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const section = await getPublicSection(id);
  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(section);
}
