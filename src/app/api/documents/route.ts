import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/requireSession";
import { normalizeTags } from "@/lib/tags";
import { safeRevalidateTag } from "@/lib/revalidate";
import { cacheTags } from "@/lib/cacheTags";

export async function GET() {
  const { session, response } = await requireSession();
  if (!session) return response;
  const docs = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(
    docs.map((d) => ({
      ...d,
      tags: normalizeTags(d.tags, { strict: false }).tags,
    }))
  );
}

export async function POST(request: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;
  const body = await request.json().catch(() => ({}));
  const title = (body.title ?? "").toString().trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const description = (body.description ?? "").toString();
  const renderedContent = (body.renderedContent ?? "").toString();
  const tags = normalizeTags(body.tags ?? [], { strict: false }).tags;
  const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = `${slugBase || "doc"}-${Date.now().toString(36)}`;

  const doc = await prisma.document.create({
    data: {
      title,
      description,
      renderedContent,
      tags,
      visibility: "PRIVATE",
      userId: session.user.id,
      slug,
    },
  });

  safeRevalidateTag(cacheTags.list("all"));
  safeRevalidateTag(cacheTags.list("file"));
  safeRevalidateTag(cacheTags.tags);
  safeRevalidateTag(cacheTags.detail("file", doc.slug));
  safeRevalidateTag(cacheTags.landing);

  return NextResponse.json(doc, { status: 201 });
}
