import { NextResponse } from "next/server";
import { getPublicTemplate } from "@/lib/publicTemplates";
import { cacheHeaders } from "@/config/cache";

type RouteContext = { params: Promise<{ id: string }> };

function renderBody(template: string, values: Record<string, string>) {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => values[key] ?? "");
}

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  const start = performance.now();
  const { id } = await context.params;
  const template = await getPublicTemplate(id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const values = (body?.values ?? {}) as Record<string, string>;
  const rendered = renderBody(template.body, values);

  const headers = new Headers(cacheHeaders("detail", request.headers.get("cookie")));
  headers.set("Server-Timing", `app;dur=${(performance.now() - start).toFixed(1)}`);
  headers.set("x-cache-profile", "detail");

  return NextResponse.json({ rendered }, { headers });
}
