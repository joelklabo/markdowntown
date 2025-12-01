import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { getPublicSection } from "@/lib/publicSections";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { normalizeTags } from "@/lib/tags";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sample = sampleItems.find((i) => i.id === params.id && i.type === "snippet");
  if (sample) {
    return {
      title: `${sample.title} | MarkdownTown`,
      description: sample.description,
    };
  }
  const section = await getPublicSection(params.id);
  if (section) {
    return {
      title: `${section.title} | MarkdownTown`,
      description: section.content.slice(0, 160) || "Markdown snippet",
    };
  }
  return { title: "Snippet not found" };
}

export default async function SnippetDetail({ params }: { params: { id: string } }) {
  const sample = sampleItems.find((i) => i.id === params.id && i.type === "snippet");
  const section = sample ? null : await getPublicSection(params.id);
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

      <Card className="space-y-3">
        <h3 className="text-h3">Rendered preview</h3>
        <div className="rounded-lg border border-mdt-border bg-white p-4 text-sm leading-6 dark:border-mdt-border-dark dark:bg-mdt-bg-dark">
          <p>{item.description}</p>
          <p className="text-mdt-muted text-xs mt-3">(Sample rendering until real markdown content is wired.)</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-h3">Raw markdown</h3>
        <pre className="rounded-lg border border-mdt-border bg-[#0f172a]/5 p-4 font-mono text-xs whitespace-pre-wrap dark:border-mdt-border-dark dark:bg-[#0f172a] text-mdt-text-dark">
# {item.title}

{item.description}
        </pre>
      </Card>

      <Card className="space-y-2">
        <h4 className="text-h4">Related</h4>
        <div className="flex flex-wrap gap-2 text-sm text-mdt-muted">
          {sampleItems.filter((i) => i.type === "snippet" && i.id !== item.id).slice(0, 3).map((rel) => (
            <Link key={rel.id} href={`/snippets/${rel.id}`} className="underline">
              {rel.title}
            </Link>
          ))}
        </div>
      </Card>
    </main>
  );
}
