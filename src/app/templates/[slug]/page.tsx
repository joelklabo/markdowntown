import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import Link from "next/link";
import type { Metadata } from "next";

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
        <div className="flex gap-2">
          <Button size="sm">Copy filled</Button>
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

      <Card className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-h3">Fill placeholders</h3>
          <div className="space-y-2 text-sm text-mdt-muted">
            <div className="flex items-center justify-between rounded-lg border border-mdt-border px-3 py-2 dark:border-mdt-border-dark">
              <span>project_name</span>
              <input className="w-40 rounded-md border border-mdt-border px-2 py-1 text-xs" placeholder="my-repo" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-mdt-border px-3 py-2 dark:border-mdt-border-dark">
              <span>style</span>
              <input className="w-40 rounded-md border border-mdt-border px-2 py-1 text-xs" placeholder="concise" />
            </div>
            <p className="text-xs text-mdt-muted">(Sample form; real template fields will render here.)</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-h3">Live preview</h3>
          <div className="rounded-lg border border-mdt-border bg-white p-4 text-sm leading-6 dark:border-mdt-border-dark dark:bg-mdt-bg-dark min-h-[200px]">
            Preview will update as you fill fields.
          </div>
        </div>
      </Card>
    </main>
  );
}
