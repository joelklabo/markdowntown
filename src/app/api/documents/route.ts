import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizeTags } from "@/lib/tags";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

  return NextResponse.json(doc, { status: 201 });
}
