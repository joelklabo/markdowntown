import { sampleItems, sampleTags, type SampleItem } from "@/lib/sampleContent";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { normalizeTags } from "@/lib/tags";
import Link from "next/link";
import type { Metadata } from "next";
import { listTopTags } from "@/lib/publicTags";
import { BrowseSearch } from "@/components/browse/BrowseSearch";
import { BrowseResults } from "@/components/browse/BrowseResults";
import { BrowseFilterPills } from "@/components/browse/BrowseFilterPills";

export const metadata: Metadata = {
  title: "Browse library | MarkdownTown",
  description: "Discover reusable snippets, templates, and agents.md files to assemble your next agents.md.",
};

export const revalidate = 60;

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

  const hrefWith = (overrides: { sort?: string; type?: string; tag?: string; clearTags?: boolean; removeTag?: string }) => {
    const params = new URLSearchParams(baseParams);
    if (overrides.sort) params.set("sort", overrides.sort);
    if (overrides.type) params.set("type", overrides.type);
    if (overrides.clearTags) params.delete("tag");
    if (overrides.tag) params.append("tag", overrides.tag);
    if (overrides.removeTag) {
      const toRemove = overrides.removeTag;
      const remaining = params.getAll("tag").filter((t) => t !== toRemove);
      params.delete("tag");
      remaining.forEach((t) => params.append("tag", t));
    }
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

  const sortOptions = [
    { label: "Trending", key: "trending" },
    { label: "New", key: "new" },
    { label: "Most copied", key: "copied" },
    { label: "Top rated", key: "top" },
  ].map((option) => ({ ...option, href: hrefWith({ sort: option.key }), active: (sortParam ?? "new") === option.key }));

  const typeOptions = [
    { label: "All", key: "all" },
    { label: "Snippets", key: "snippet" },
    { label: "Templates", key: "template" },
    { label: "agents.md", key: "file" },
  ].map((option) => ({ ...option, href: hrefWith({ type: option.key }), active: (typeParam ?? "all") === option.key }));

  const popularTagOptions = popularTags.map((tag) => {
    const normalized = normalizeTags(tag, { strict: false }).tags[0] ?? tag;
    const active = activeTags.includes(normalized);
    return { label: normalized, href: hrefWith({ tag: normalized }), active };
  });

  const activeTagOptions = activeTags.map((tag) => ({ label: tag, removeHref: hrefWith({ removeTag: tag }) }));
  const clearTagsHref = hrefWith({ clearTags: true });

  const filtered = query
    ? cards.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : cards;

  const baseQueryString = baseParams.toString();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <section className="flex flex-col gap-4 rounded-mdt-lg border border-mdt-border bg-mdt-surface p-6 shadow-mdt-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-caption text-mdt-muted">Explore</p>
            <h1 className="text-display font-display">Browse snippets, templates, and agents.md files</h1>
            <p className="text-body text-mdt-muted max-w-2xl">
              Copy anything without signing in. Use filters and tags to find the right building blocks, then add them to the builder or download directly.
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

        <form className="grid gap-3 md:grid-cols-[1.2fr_auto] md:items-center" action="/browse" method="get">
          <BrowseSearch initialQuery={query ?? ""} baseQueryString={baseQueryString} />
          <div className="flex flex-wrap justify-end gap-2">
            {[
              { label: "Trending", key: "trending" },
              { label: "New", key: "new" },
              { label: "Most copied", key: "copied" },
              { label: "Top rated", key: "top" },
            ].map((option) => {
              const active = (sortParam ?? "new") === option.key;
              return (
                <Button
                  key={option.key}
                  type="submit"
                  name="sort"
                  value={option.key}
                  variant={active ? "primary" : "ghost"}
                  size="sm"
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Card className="hidden space-y-4 bg-mdt-surface shadow-mdt-sm md:block">
          <BrowseFilterPills
            sortOptions={sortOptions}
            typeOptions={typeOptions}
            popularTags={popularTagOptions}
            activeTags={activeTagOptions}
            clearTagsHref={clearTagsHref}
          />
        </Card>

        <div className="md:hidden">
          <details className="rounded-mdt-md border border-mdt-border bg-mdt-surface p-3 shadow-mdt-sm">
            <summary className="cursor-pointer text-sm font-semibold text-mdt-text">
              Filters & tags
            </summary>
            <div className="mt-3 space-y-3">
              <BrowseFilterPills
                sortOptions={sortOptions}
                typeOptions={typeOptions}
                popularTags={popularTagOptions}
                activeTags={activeTagOptions}
                clearTagsHref={clearTagsHref}
              />
            </div>
          </details>
        </div>

        <BrowseResults
          initialItems={filtered}
          query={query}
          sortParam={sortParam}
          typeParam={typeParam}
          activeTags={activeTags}
        />
      </section>
    </main>
  );
}
