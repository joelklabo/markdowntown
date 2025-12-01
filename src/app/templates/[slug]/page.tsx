import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { Metadata } from "next";
import { TemplateFormPreview, type TemplateField, renderTemplateBody } from "@/components/template/TemplateFormPreview";
import { LibraryCard } from "@/components/LibraryCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getPublicTemplate } from "@/lib/publicTemplates";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { normalizeTags } from "@/lib/tags";
import { TemplateActions } from "@/components/template/TemplateActions";

type TemplateParams = { slug: string };

const findTemplateBySlug = (slug: string) => sampleItems.find((i) => (i.slug ?? i.id) === slug && i.type === "template");

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<TemplateParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findTemplateBySlug(slug) ?? (await getPublicTemplate(slug));
  if (!item) return { title: "Template not found" };
  return {
    title: `${item.title} | MarkdownTown`,
    description: (item as any).description ?? "",
  };
}

export default async function TemplateDetail({
  params,
}: {
  params: Promise<TemplateParams>;
}) {
  const { slug } = await params;
  const template = await getPublicTemplate(slug);
  const fallback = findTemplateBySlug(slug);
  const data = template ?? fallback;
  if (!data) return notFound();

  const fields: TemplateField[] =
    (Array.isArray((data as any).fields) ? ((data as any).fields as TemplateField[]) : []) || [];
  const body = (data as any).body ?? (data as any).description ?? "";
  const tags = normalizeTags((data as any).tags ?? [], { strict: false }).tags;
  const stats = (data as any).stats ?? {
    views: (data as any).views ?? 0,
    copies: (data as any).copies ?? 0,
    votes: (data as any).uses ?? 0,
  };

  const relatedPublic = template
    ? await listPublicItems({ limit: 6, tags, type: "template" })
    : [];
  const toCard = (item: PublicItem) => ({
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    description: item.description ?? "",
    tags: normalizeTags(item.tags, { strict: false }).tags,
    stats: item.stats,
    type: item.type,
  });
  const related = relatedPublic.length
    ? relatedPublic.filter((rel) => rel.id !== (data as any).id).map(toCard).slice(0, 3)
    : sampleItems.filter((i) => i.type === "template" && i.id !== (data as any).id).slice(0, 3);

  const initialValues = Object.fromEntries(fields.map((f) => [f.name, f.placeholder ?? (f.required ? "" : "")]));
  const initialRendered = renderTemplateBody(body, initialValues);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Breadcrumb
        segments={[
          { href: "/", label: "Home" },
          { href: "/templates", label: "Templates" },
          { label: (data as any).title },
        ]}
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Pill tone="blue">Template</Pill>
          {(data as any).badge && <Pill tone="yellow">{(data as any).badge}</Pill>}
        </div>
        <h1 className="text-display leading-tight">{(data as any).title}</h1>
        <p className="text-body text-mdt-muted max-w-3xl">{(data as any).description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Pill key={tag} tone="gray">#{tag}</Pill>
          ))}
        </div>
        <TemplateActions id={(data as any).id} slug={(data as any).slug} title={(data as any).title} rendered={initialRendered} />
        <div className="text-xs text-mdt-muted flex gap-3">
          <span>{stats.views.toLocaleString()} views</span>
          <span>{stats.copies.toLocaleString()} copies</span>
          <span>{stats.votes.toLocaleString()} votes</span>
        </div>
      </div>

      <TemplateFormPreview title={(data as any).title} body={body} fields={fields} />

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
            <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{(data as any).title}</p>
          </div>
          <TemplateActions id={(data as any).id} slug={(data as any).slug} title={(data as any).title} rendered={initialRendered} />
        </div>
      </div>
    </main>
  );
}
