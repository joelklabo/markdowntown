import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/requireSession";
import { verifyCaptcha } from "@/lib/captcha";
import { rateLimit } from "@/lib/rateLimiter";
import { logAbuseSignal } from "@/lib/reports";

const MAX_COMMENT_LENGTH = 800;

export async function POST(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const traceId = req.headers.get("x-trace-id") ?? undefined;

  if (!rateLimit(`comment-ip:${ip}`) || !rateLimit(`comment-user:${session.user.id}`)) {
    logAbuseSignal({ ip, userId: session.user.id, reason: "rate-limit-comment", traceId });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const targetId = typeof body.targetId === "string" ? body.targetId : null;
  const targetType = typeof body.targetType === "string" ? body.targetType : null;
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const captcha = typeof body.captcha === "string" ? body.captcha : null;

  if (!targetId || !targetType) return NextResponse.json({ error: "Missing target" }, { status: 400 });
  if (!content) return NextResponse.json({ error: "Comment required" }, { status: 400 });
  if (content.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: `Comment too long (max ${MAX_COMMENT_LENGTH})` }, { status: 400 });
  }

  const needsCaptcha = !rateLimit(`comment-captcha:${session.user.id}`); // triggered after burst
  if (needsCaptcha) {
    const ok = await verifyCaptcha(captcha, process.env.TURNSTILE_SECRET_KEY);
    if (!ok) {
      logAbuseSignal({ ip, userId: session.user.id, reason: "captcha-failed", traceId });
      return NextResponse.json({ error: "Captcha required" }, { status: 403 });
    }
  }

  // Basic target guard: ensure target exists and is not private to another user
  const snippet = await prisma.snippet.findFirst({
    where: {
      id: targetId,
      OR: [
        { visibility: { in: ["PUBLIC", "UNLISTED"] } },
        { userId: session.user.id },
      ],
    },
    select: { id: true, userId: true, visibility: true },
  });
  if (!snippet) return NextResponse.json({ error: "Target not found" }, { status: 404 });

  const created = await prisma.comment.create({
    data: {
      targetId,
      targetType,
      body: content,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, id: created.id });
}
