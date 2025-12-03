import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/requireSession";
import { rateLimit } from "@/lib/rateLimiter";
import { logAbuseSignal } from "@/lib/reports";

export async function POST(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const traceId = req.headers.get("x-trace-id") ?? undefined;
  if (!rateLimit(`vote-ip:${ip}`) || !rateLimit(`vote-user:${session.user.id}`)) {
    logAbuseSignal({ ip, userId: session.user.id, reason: "rate-limit-vote", traceId });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const targetId = typeof body.targetId === "string" ? body.targetId : null;
  const targetType = body.targetType === "snippet" || body.targetType === "template" || body.targetType === "document"
    ? body.targetType
    : null;
  const value = body.value === 1 || body.value === -1 ? body.value : null;

  if (!targetId || !targetType || value === null) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  // Ensure target exists and is accessible
  const target = await prisma[targetType].findFirst({
    where: {
      id: targetId,
      OR: [
        { visibility: { in: ["PUBLIC", "UNLISTED"] } },
        { userId: session.user.id },
      ],
    },
    select: { id: true, visibility: true, userId: true },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const vote = await prisma.vote.upsert({
    where: { userId_targetType_targetId: { userId: session.user.id, targetType, targetId } },
    update: { value },
    create: { userId: session.user.id, targetType, targetId, value },
  });

  // Update counters
  const votesUp = await prisma.vote.count({ where: { targetType, targetId, value: 1 } });
  const votesDown = await prisma.vote.count({ where: { targetType, targetId, value: -1 } });

  await prisma[targetType].update({
    where: { id: targetId },
    data: { votesUp, votesDown },
  });

  return NextResponse.json({ ok: true, score: votesUp - votesDown, vote });
}
