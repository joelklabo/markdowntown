import { NextResponse } from "next/server";
import { getPublicTemplate } from "@/lib/publicTemplates";

type RouteContext = { params: Promise<{ id: string }> };

function renderBody(template: string, values: Record<string, string>) {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => values[key] ?? "");
}

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const template = await getPublicTemplate(id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const values = (body?.values ?? {}) as Record<string, string>;
  const rendered = renderBody(template.body, values);

  return NextResponse.json({ rendered });
}
