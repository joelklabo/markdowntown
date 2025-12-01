import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { getPublicSection } from "@/lib/publicSections";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { normalizeTags } from "@/lib/tags";
import Link from "next/link";
import type { Metadata } from "next";
import { SnippetTabs } from "@/components/snippet/SnippetTabs";
import { LibraryCard } from "@/components/LibraryCard";

type SnippetParams = { slug: string };

const findSnippetBySlug = (slug: string) => sampleItems.find((i) => (i.slug ?? i.id) === slug && i.type === "snippet");

export async function generateMetadata({ params }: { params: Promise<SnippetParams> }): Promise<Metadata> {
  const { slug } = await params;
  const sample = findSnippetBySlug(slug);
  if (sample) {
    return {
      title: `${sample.title} | MarkdownTown`,
      description: sample.description,
    };
  }
  const section = await getPublicSection(slug);
  if (section) {
    return {
      title: `${section.title} | MarkdownTown`,
      description: section.content.slice(0, 160) || "Markdown snippet",
    };
  }
  return { title: "Snippet not found" };
}

export default async function SnippetDetail({ params }: { params: Promise<SnippetParams> }) {
  const { slug } = await params;
  const sample = findSnippetBySlug(slug);
  const section = sample ? null : await getPublicSection(slug);
  const item =
    sample ||
    (section && {
      id: section.id,
      title: section.title,
      description: section.content.slice(0, 240) || "Markdown snippet",
      tags: normalizeTags(section.tags, { strict: false }).tags,
      stats: { views: 0, copies: 0, votes: 0 },
      badge: undefined,
    });

  if (!item) return notFound();

  const rawContent = `# ${item.title}\n\n${item.description}`;
  const related = sampleItems.filter((i) => i.type === "snippet" && i.id !== item.id).slice(0, 3);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Pill tone="blue">Snippet</Pill>
          {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
        </div>
        <h1 className="text-display leading-tight">{item.title}</h1>
        <p className="text-body text-mdt-muted max-w-3xl">{item.description}</p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Pill key={tag} tone="gray">#{tag}</Pill>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm">Copy</Button>
          <Button variant="secondary" size="sm">Download</Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/builder?add=${item.id}`}>Add to builder</Link>
          </Button>
        </div>
        <div className="text-xs text-mdt-muted flex gap-3">
          <span>{item.stats.views.toLocaleString()} views</span>
          <span>{item.stats.copies.toLocaleString()} copies</span>
          <span>{item.stats.votes.toLocaleString()} votes</span>
        </div>
      </div>

      <SnippetTabs title={item.title} rendered={item.description} raw={rawContent} />

      <Card className="space-y-3">
        <h4 className="text-h4">Related snippets</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {related.map((rel) => (
            <LibraryCard key={rel.id} item={rel} />
          ))}
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-mdt-border bg-white/95 px-4 py-3 shadow-mdt-sm md:hidden dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Use this snippet</p>
            <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{item.title}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/builder?add=${item.id}`}>Builder</Link>
            </Button>
            <Button size="sm">Copy</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
