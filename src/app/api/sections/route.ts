import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimiter";
import { validateSectionPayload } from "@/lib/validation";
import { getSectionsCached } from "@/lib/cache";
import { logAbuseSignal } from "@/lib/reports";

const CREATE_WINDOW = 60_000;
const CREATE_MAX = 10;
const createBucket = new Map<string, { count: number; reset: number }>();

function throttleCreate(key: string) {
  const now = Date.now();
  const bucket = createBucket.get(key);
  if (!bucket || bucket.reset < now) {
    createBucket.set(key, { count: 1, reset: now + CREATE_WINDOW });
    return true;
  }
  bucket.count += 1;
  if (bucket.count > CREATE_MAX) return false;
  return true;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sections = await getSectionsCached(session.user.id);

  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`post:${ip}`)) {
    logAbuseSignal({ ip, userId: session.user.id, reason: "rate-limit-post" });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  if (!throttleCreate(session.user.id)) {
    logAbuseSignal({ ip, userId: session.user.id, reason: "throttle-post" });
    return NextResponse.json({ error: "Too many new sections, please wait a minute." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : null;
  const content = typeof body.content === "string" ? body.content : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const validationError = validateSectionPayload(title, content);
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
