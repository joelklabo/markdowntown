import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimiter";

const MAX_CONTENT_LENGTH = 10_000;
const MAX_TITLE_LENGTH = 140;

type RouteContext = { params: Promise<{ id: string }> };

async function authorizeSection(context: RouteContext, userId: string) {
  const { id } = await context.params;
  return prisma.section.findFirst({
    where: { id, userId },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const section = await authorizeSection(context, session.user.id);
  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(section);
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`put:${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const updateData: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) {
    updateData.title = body.title.trim();
    if ((updateData.title as string).length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title is too long (max ${MAX_TITLE_LENGTH} characters)` },
        { status: 400 }
      );
    }
  }
  if (typeof body.content === "string") {
    updateData.content = body.content;
    const content = updateData.content as string;
    const lower = content.toLowerCase();
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content is too long (max ${MAX_CONTENT_LENGTH} characters)` },
        { status: 400 }
      );
    }
    if (lower.includes("<script") || lower.includes("<iframe") || lower.includes("javascript:")) {
      return NextResponse.json({ error: "Content contains disallowed markup" }, { status: 400 });
    }
  }
  if (typeof body.order === "number") {
    updateData.order = body.order;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No updates supplied" }, { status: 400 });
  }

  const section = await authorizeSection(context, session.user.id);
  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { id } = await context.params;
  const updated = await prisma.section.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = (await _request)?.headers?.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`del:${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const section = await authorizeSection(context, session.user.id);
  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { id } = await context.params;
  await prisma.section.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
