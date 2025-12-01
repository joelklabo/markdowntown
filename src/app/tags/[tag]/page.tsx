import Link from "next/link";
import type { Metadata } from "next";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { listTopTags } from "@/lib/publicTags";
import { normalizeTags } from "@/lib/tags";
import { sampleItems } from "@/lib/sampleContent";
import { LibraryCard } from "@/components/LibraryCard";

type TagParams = { tag: string };

export async function generateMetadata({ params }: { params: Promise<TagParams> }): Promise<Metadata> {
  const { tag } = await params;
  const title = `#${tag} snippets & templates | MarkdownTown`;
  return { title, description: `Browse snippets, templates, and files tagged #${tag}.` };
}

function toCard(item: PublicItem) {
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

export default async function TagDetail({ params }: { params: Promise<TagParams> }) {
  const { tag } = await params;
  const normalized = normalizeTags(tag, { strict: false }).tags[0] ?? tag;

  const items = await listPublicItems({ limit: 48, tags: [normalized], sort: "recent" });
  const cards = (items.length ? items.map(toCard) : sampleItems)
    .filter((i) => normalizeTags(i.tags, { strict: false }).tags.includes(normalized))
    .map((i) => ({ ...i, tags: normalizeTags(i.tags, { strict: false }).tags }));

  const popularTagsRaw = await listTopTags(12, 30);
  const popularTags = popularTagsRaw.length ? popularTagsRaw.map((t) => t.tag) : [];

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-mdt-muted flex gap-2">
        <Link href="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link href="/tags" className="hover:underline">Tags</Link>
        <span>/</span>
        <span className="text-mdt-text dark:text-mdt-text-dark">#{normalized}</span>
      </nav>

      <div className="space-y-2">
        <p className="text-caption text-mdt-muted">Tag</p>
        <h1 className="text-display leading-tight">#{normalized}</h1>
        <p className="text-body text-mdt-muted max-w-3xl">
          Snippets, templates, and agents.md files labeled with <strong>#{normalized}</strong>.
        </p>
        {popularTags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-mdt-muted">
            <span>Popular:</span>
            {popularTags.map((t) => (
              <Link key={t} href={`/tags/${t}`} className="underline">
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
        {cards.length === 0 && (
          <p className="sm:col-span-2 lg:col-span-3 text-sm text-mdt-muted">No items tagged #{normalized} yet.</p>
        )}
      </div>
    </main>
  );
}
