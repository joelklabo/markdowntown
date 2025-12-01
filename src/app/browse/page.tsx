import { sampleItems, type SampleItem } from "@/lib/sampleContent";
import { listPublicSections, type PublicSection } from "@/lib/publicSections";
import { LibraryCard } from "@/components/LibraryCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { normalizeTags } from "@/lib/tags";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse library | MarkdownTown",
  description: "Discover reusable snippets, templates, and agents.md files to assemble your next agents.md.",
};

function sectionToCard(section: PublicSection): SampleItem {
  const description = section.content?.slice(0, 140) || "Markdown snippet";
  const tags = normalizeTags(section.tags, { strict: false }).tags;
  return {
    id: section.id,
    slug: section.slug ?? undefined,
    title: section.title,
    description,
    tags,
    stats: { copies: 0, views: 0, votes: 0 },
    type: "snippet" as const,
  };
}

function normalizeSearchTags(searchParams?: { tag?: string | string[]; tags?: string | string[] }) {
  const raw = searchParams?.tag ?? searchParams?.tags ?? [];
  const value = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return normalizeTags(value, { strict: false }).tags;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams?: { tag?: string | string[]; tags?: string | string[] };
}) {
  const activeTags = normalizeSearchTags(searchParams);
  const sections = await listPublicSections(30);
  const cards: SampleItem[] = sections.length > 0 ? sections.map(sectionToCard) : sampleItems;
  const normalizedCards: SampleItem[] = cards.map((item) => ({
    ...item,
    tags: normalizeTags(item.tags, { strict: false }).tags,
  }));
  const filtered = activeTags.length
    ? normalizedCards.filter((item) =>
        activeTags.every((tag) => item.tags.includes(tag))
      )
    : normalizedCards;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-caption text-mdt-muted">Library</p>
          <h1 className="text-display">Browse snippets, templates, and agents.md files</h1>
          <p className="text-body text-mdt-muted max-w-2xl">
            Copy anything without signing in. Use filters and tags to find the right building blocks, then
            add them to the builder or download directly.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href="/templates">Templates</Link>
          </Button>
          <Button asChild>
            <Link href="/builder">Open builder</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Sort</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Trending", href: "?sort=trending" },
                { label: "New", href: "?sort=new" },
                { label: "Most copied", href: "?sort=copied" },
                { label: "Top rated", href: "?sort=top" },
              ].map((option) => (
                <Pill key={option.label} tone="gray">
                  <Link href={option.href}>{option.label}</Link>
                </Pill>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Types</p>
            <div className="flex flex-wrap gap-2">
              <Pill tone="blue">All</Pill>
              <Pill tone="gray">Snippets</Pill>
              <Pill tone="gray">Templates</Pill>
              <Pill tone="gray">agents.md</Pill>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Popular tags</p>
            <div className="flex flex-wrap gap-2">
              {["system", "tools", "templates", "qa", "style", "cli"].map((tag) => (
                <Pill key={tag} tone="gray">#{normalizeTags(tag, { strict: false }).tags[0] ?? tag}</Pill>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTags.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2" aria-label="Active tag filters">
              {activeTags.map((tag) => (
                <Pill key={tag} tone="blue">#{tag}</Pill>
              ))}
              <Link href="/browse" className="text-sm text-indigo-600 underline">
                Clear filters
              </Link>
            </div>
          )}
          {filtered.map((item) => (
            <LibraryCard key={item.id} item={item} />
          ))}
          {filtered.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-mdt-border bg-white p-6 text-sm text-mdt-muted dark:border-mdt-border-dark dark:bg-mdt-bg-dark dark:text-mdt-text-dark">
              No results for those tags yet. Try removing a filter.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
