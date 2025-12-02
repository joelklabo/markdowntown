import { Metadata } from "next";
import { BuilderClient } from "@/components/BuilderClient";
import { prisma } from "@/lib/prisma";
import { sampleItems } from "@/lib/sampleContent";
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
      console.warn("builder: falling back to samples", err);
      userTemplates = [];
      userSnippets = [];
    }
  }

  const fallbackTemplates = sampleItems.filter((i) => i.type === "template").map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    body: t.description, // sample body placeholder
    tags: t.tags,
  }));
  const fallbackSnippets = sampleItems.filter((i) => i.type === "snippet").map((s) => ({
    id: s.id,
    title: s.title,
    content: s.description,
    tags: s.tags,
  }));

  const templates = (userTemplates.length ? userTemplates.map(mapTemplate) : fallbackTemplates).slice(0, 30);
  const snippets = (userSnippets.length ? userSnippets.map(mapSnippet) : fallbackSnippets).slice(0, 60);

  return <BuilderClient templates={templates} snippets={snippets} requireAuth={!userId} />;
}
