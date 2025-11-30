import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimiter";

const MAX_CONTENT_LENGTH = 10_000;
const MAX_TITLE_LENGTH = 140;

export function validatePayload(title: string | null, content: string) {
  if (!title) {
    return "Title is required";
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return `Title is too long (max ${MAX_TITLE_LENGTH} characters)`;
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return `Content is too long (max ${MAX_CONTENT_LENGTH} characters)`;
  }
  const lower = content.toLowerCase();
  if (lower.includes("<script") || lower.includes("<iframe") || lower.includes("javascript:")) {
    return "Content contains disallowed markup";
  }
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sections = await prisma.section.findMany({
    where: { userId: session.user.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`post:${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : null;
  const content = typeof body.content === "string" ? body.content : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const validationError = validatePayload(title, content);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const nextOrder = await prisma.section.count({ where: { userId: session.user.id } });

  const section = await prisma.section.create({
    data: {
      title,
      content,
      order: nextOrder,
      userId: session.user.id,
    },
  });

  return NextResponse.json(section, { status: 201 });
}
