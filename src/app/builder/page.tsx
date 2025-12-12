import { Metadata } from "next";
import { BuilderClient } from "@/components/BuilderClient";
import { prisma } from "@/lib/prisma";
import { normalizeTags } from "@/lib/tags";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Builder | MarkdownTown",
  description: "Assemble snippets and templates into a single agents.md and export without signing in.",
};

function mapTemplate(t: { id: string; title: string; description: string | null; body: string; tags: string[] }) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    body: t.body ?? "",
    tags: normalizeTags(t.tags, { strict: false }).tags,
  };
}

function mapSnippet(s: { id: string; title: string; content: string; tags: string[] }) {
  return {
    id: s.id,
    title: s.title,
    content: s.content ?? "",
    tags: normalizeTags(s.tags, { strict: false }).tags,
  };
}

export default async function BuilderPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  type TemplateRow = { id: string; title: string; description: string | null; body: string; tags: string[] };
  type SnippetRow = { id: string; title: string; content: string; tags: string[] };
  let userTemplates: TemplateRow[] = [];
  let userSnippets: SnippetRow[] = [];

  if (userId) {
    try {
      [userTemplates, userSnippets] = await Promise.all([
        prisma.template.findMany({
          where: { userId },
          select: { id: true, title: true, description: true, body: true, tags: true },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.snippet.findMany({
          where: { userId },
          select: { id: true, title: true, content: true, tags: true },
          orderBy: { updatedAt: "desc" },
        }),
      ]);
    } catch (err) {
      console.warn("builder: falling back to empty lists", err);
      userTemplates = [];
      userSnippets = [];
    }
  }

  const templates = userTemplates.map(mapTemplate).slice(0, 30);
  const snippets = userSnippets.map(mapSnippet).slice(0, 60);

  return <BuilderClient templates={templates} snippets={snippets} requireAuth={!userId} />;
}
