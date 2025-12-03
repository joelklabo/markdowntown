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
  if (!rateLimit(`fav-ip:${ip}`) || !rateLimit(`fav-user:${session.user.id}`)) {
    logAbuseSignal({ ip, userId: session.user.id, reason: "rate-limit-favorite", traceId });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const targetId = typeof body.targetId === "string" ? body.targetId : null;
  const targetType = body.targetType === "snippet" || body.targetType === "template" || body.targetType === "document"
    ? body.targetType
    : null;

  if (!targetId || !targetType) return NextResponse.json({ error: "Invalid favorite" }, { status: 400 });

  const target = await prisma[targetType].findFirst({
    where: {
      id: targetId,
      OR: [
        { visibility: { in: ["PUBLIC", "UNLISTED"] } },
        { userId: session.user.id },
      ],
    },
    select: { id: true },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.favorite.upsert({
    where: { userId_targetType_targetId: { userId: session.user.id, targetType, targetId } },
    update: {},
    create: { userId: session.user.id, targetType, targetId },
  });

  const favoritesCount = await prisma.favorite.count({ where: { targetType, targetId } });
  await prisma[targetType].update({
    where: { id: targetId },
    data: { favoritesCount },
  });

  return NextResponse.json({ ok: true, favoritesCount });
}
