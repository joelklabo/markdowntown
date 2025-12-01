import { sampleItems, sampleTags, type SampleItem } from "@/lib/sampleContent";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { LibraryCard } from "@/components/LibraryCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { normalizeTags } from "@/lib/tags";
import Link from "next/link";
import type { Metadata } from "next";
import { listTopTags } from "@/lib/publicTags";

export const metadata: Metadata = {
  title: "Browse library | MarkdownTown",
  description: "Discover reusable snippets, templates, and agents.md files to assemble your next agents.md.",
};

function toCard(item: PublicItem): SampleItem {
  return {
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    description: item.description || "Markdown snippet",
    tags: normalizeTags(item.tags, { strict: false }).tags,
    stats: item.stats,
    type: item.type,
  };
}

function normalizeSearchTags(searchParams?: { tag?: string | string[]; tags?: string | string[] }) {
  const raw = searchParams?.tag ?? searchParams?.tags ?? [];
  const value = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return normalizeTags(value, { strict: false }).tags;
}

type BrowseSearchParams = { tag?: string | string[]; tags?: string | string[]; sort?: string; type?: string; q?: string };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolved = (await searchParams) ?? {};
  const params = resolved as BrowseSearchParams;
  const activeTags = normalizeSearchTags(params);
  const sortParam = params.sort;
  const sort =
    sortParam === "copied"
      ? "copies"
      : sortParam === "top" || sortParam === "trending"
        ? "views"
        : "recent";

  const typeParam = params.type;
  const type =
    typeParam === "template"
      ? "template"
      : typeParam === "file"
        ? "file"
        : typeParam === "snippet"
          ? "snippet"
          : "all";

  const query = params.q ?? null;

  const baseParams = new URLSearchParams();
  activeTags.forEach((tag) => baseParams.append("tag", tag));
  if (sortParam) baseParams.set("sort", sortParam);
  if (typeParam) baseParams.set("type", typeParam);
  if (query) baseParams.set("q", query);

  const hrefWith = (overrides: { sort?: string; type?: string; tag?: string; clearTags?: boolean }) => {
    const params = new URLSearchParams(baseParams);
    if (overrides.sort) params.set("sort", overrides.sort);
    if (overrides.type) params.set("type", overrides.type);
    if (overrides.clearTags) params.delete("tag");
    if (overrides.tag) params.append("tag", overrides.tag);
    const search = params.toString();
    return `/browse${search ? `?${search}` : ""}`;
  };

  const items = await listPublicItems({ limit: 60, tags: activeTags, sort, type, search: query });
  const popularTagsRaw = await listTopTags(12, 30);
  const popularTags = popularTagsRaw.length ? popularTagsRaw.map((t) => t.tag) : sampleTags.map((t) => t.tag);

  const cards: SampleItem[] = (items.length ? items.map(toCard) : sampleItems).map((item) => ({
    ...item,
    tags: normalizeTags(item.tags, { strict: false }).tags,
  }));

  const filtered = query
    ? cards.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : cards;

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
                { label: "Trending", key: "trending" },
                { label: "New", key: "new" },
                { label: "Most copied", key: "copied" },
                { label: "Top rated", key: "top" },
              ].map((option) => (
                <Pill
                  key={option.label}
                  tone={(sortParam ?? "new") === option.key ? "blue" : "gray"}
                >
                  <Link href={hrefWith({ sort: option.key })}>{option.label}</Link>
                </Pill>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Types</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", key: "all" },
                { label: "Snippets", key: "snippet" },
                { label: "Templates", key: "template" },
                { label: "agents.md", key: "file" },
              ].map((option) => (
                <Pill
                  key={option.key}
                  tone={(typeParam ?? "all") === option.key ? "blue" : "gray"}
                >
                  <Link href={hrefWith({ type: option.key })}>{option.label}</Link>
                </Pill>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Popular tags</p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => {
                const normalized = normalizeTags(tag, { strict: false }).tags[0] ?? tag;
                const active = activeTags.includes(normalized);
                return (
                  <Pill key={tag} tone={active ? "blue" : "gray"}>
                    <Link href={hrefWith({ tag: normalized })}>#{normalized}</Link>
                  </Pill>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTags.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2" aria-label="Active tag filters">
              {activeTags.map((tag) => (
                <Pill key={tag} tone="blue">#{tag}</Pill>
              ))}
              <Link href={hrefWith({ clearTags: true })} className="text-sm text-indigo-600 underline">
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
