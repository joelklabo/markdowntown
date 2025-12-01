import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import Link from "next/link";
import type { Metadata } from "next";
import { TemplateFormPreview, type TemplateField } from "@/components/template/TemplateFormPreview";
import { LibraryCard } from "@/components/LibraryCard";

type TemplateParams = { slug: string };

const findTemplateBySlug = (slug: string) => sampleItems.find((i) => (i.slug ?? i.id) === slug && i.type === "template");

export async function generateMetadata({
  params,
}: {
  params: Promise<TemplateParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findTemplateBySlug(slug);
  if (!item) return { title: "Template not found" };
  return {
    title: `${item.title} | MarkdownTown`,
    description: item.description,
  };
}

export default async function TemplateDetail({
  params,
}: {
  params: Promise<TemplateParams>;
}) {
  const { slug } = await params;
  const item = findTemplateBySlug(slug);
  if (!item) return notFound();

  const fields: TemplateField[] = [
    { name: "project_name", label: "Project name", placeholder: "my-repo", required: true },
    { name: "style", label: "Style", placeholder: "concise, direct", description: "Tone or style guidance." },
    { name: "audience", label: "Audience", placeholder: "team, execs, contributors" },
  ];

  const templateBody = `# {{project_name}} bug-hunt session

Context: focus on {{audience}}.

Style: {{style}}.

Checklist:
- Repro steps captured
- Expected vs. actual recorded
- Logs/screenshots attached`;

  const related = sampleItems.filter((i) => i.type === "template" && i.id !== item.id).slice(0, 3);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Pill tone="blue">Template</Pill>
          {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
        </div>
        <h1 className="text-display leading-tight">{item.title}</h1>
        <p className="text-body text-mdt-muted max-w-3xl">{item.description}</p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Pill key={tag} tone="gray">#{tag}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Copy</Button>
          <Button variant="secondary" size="sm">Download</Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/builder?template=${item.id}`}>Use in builder</Link>
          </Button>
        </div>
        <div className="text-xs text-mdt-muted flex gap-3">
          <span>{item.stats.views.toLocaleString()} views</span>
          <span>{item.stats.copies.toLocaleString()} copies</span>
          <span>{item.stats.votes.toLocaleString()} votes</span>
        </div>
      </div>

      <TemplateFormPreview title={item.title} body={templateBody} fields={fields} />

      <Card className="space-y-3">
        <h4 className="text-h4">Related templates</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {related.map((rel) => (
            <LibraryCard key={rel.id} item={rel} />
          ))}
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-mdt-border bg-white/95 px-4 py-3 shadow-mdt-sm md:hidden dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Use this template</p>
            <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{item.title}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/builder?template=${item.id}`}>Builder</Link>
            </Button>
            <Button size="sm">Copy</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
