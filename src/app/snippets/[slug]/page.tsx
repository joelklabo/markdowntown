import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { getPublicSection } from "@/lib/publicSections";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { normalizeTags } from "@/lib/tags";
import type { Metadata } from "next";
import { SnippetTabs } from "@/components/snippet/SnippetTabs";
import { LibraryCard } from "@/components/LibraryCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SnippetActions } from "@/components/snippet/SnippetActions";
import { DetailWarning } from "@/components/detail/DetailWarning";
import { DetailStats } from "@/components/detail/DetailStats";
import { FeedbackCTA } from "@/components/detail/FeedbackCTA";

type SnippetParams = { slug: string };

const findSnippetBySlug = (slug: string) => sampleItems.find((i) => (i.slug ?? i.id) === slug && i.type === "snippet");

export const revalidate = 300;

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

function toSampleCard(item: PublicItem | { id: string; slug?: string | null; title: string; description: string; tags: string[]; stats: { views: number; copies: number; votes: number }; type: "snippet" | "template" | "file" }) {
  return {
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    description: item.description ?? "",
    tags: normalizeTags(item.tags, { strict: false }).tags,
    stats: item.stats,
    type: item.type,
  };
}

export default async function SnippetDetail({ params }: { params: Promise<SnippetParams> }) {
  const { slug } = await params;
  const sample = findSnippetBySlug(slug);
  const section = sample ? null : await getPublicSection(slug);
  const item =
    sample ||
    (section && {
      id: section.id,
      slug: section.slug ?? section.id,
      title: section.title,
      description: section.content.slice(0, 240) || "Markdown snippet",
      tags: normalizeTags(section.tags, { strict: false }).tags,
      stats: { views: 0, copies: 0, votes: 0 },
      badge: undefined,
    });

  if (!item) return notFound();

  const rawContent = `# ${item.title}\n\n${item.description}`;
  const visibility = (section as { visibility?: string } | null)?.visibility ?? "PUBLIC";
  const relatedPublic = section
    ? await listPublicItems({ limit: 6, tags: section.tags, type: "snippet" })
    : [];
  const related = relatedPublic.length
    ? relatedPublic.filter((rel) => rel.id !== item.id).map(toSampleCard).slice(0, 3)
    : sampleItems.filter((i) => i.type === "snippet" && i.id !== item.id).slice(0, 3);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Breadcrumb
        segments={[
          { href: "/", label: "Home" },
          { href: "/browse", label: "Browse" },
          { label: item.title },
        ]}
      />

      <Card className="space-y-4 p-5">
        <DetailWarning visibility={visibility} type="snippet" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pill tone="blue">Snippet</Pill>
              {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
            </div>
            <div className="space-y-2">
              <h1 className="text-display leading-tight">{item.title}</h1>
              <p className="text-body text-mdt-muted max-w-3xl">{item.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Pill key={tag} tone="gray">
                  #{tag}
                </Pill>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SnippetActions id={item.id} slug={item.slug} title={item.title} content={rawContent} />
            <DetailStats views={item.stats.views} copies={item.stats.copies} votes={item.stats.votes} />
          </div>
        </div>
      </Card>

      <SnippetTabs title={item.title} rendered={item.description} raw={rawContent} />

      <Card className="space-y-3">
        <h4 className="text-h4">Quality signals</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-3 text-sm">
            <p className="text-caption text-mdt-muted">Copies</p>
            <p className="text-h3 font-display">{item.stats.copies.toLocaleString()}</p>
          </div>
          <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-3 text-sm">
            <p className="text-caption text-mdt-muted">Views</p>
            <p className="text-h3 font-display">{item.stats.views.toLocaleString()}</p>
          </div>
          <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-3 text-sm">
            <p className="text-caption text-mdt-muted">Votes</p>
            <p className="text-h3 font-display">{item.stats.votes.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h4 className="text-h4">Related snippets</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {related.map((rel) => (
            <LibraryCard key={rel.id} item={rel} />
          ))}
        </div>
      </Card>

      <FeedbackCTA title="snippet" />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-mdt-border bg-white/95 px-4 py-3 shadow-mdt-sm md:hidden dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Use this snippet</p>
            <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{item.title}</p>
          </div>
          <SnippetActions id={item.id} slug={item.slug} title={item.title} content={rawContent} variant="bar" />
        </div>
      </div>
    </main>
  );
}
