import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { Metadata } from "next";
import { TemplateFormPreview, type TemplateField } from "@/components/template/TemplateFormPreview";
import { renderTemplateBody } from "@/lib/renderTemplate";
import { LibraryCard } from "@/components/LibraryCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getPublicTemplate, type PublicTemplate } from "@/lib/publicTemplates";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { normalizeTags } from "@/lib/tags";
import { TemplateActions } from "@/components/template/TemplateActions";

type TemplateParams = { slug: string };

const findTemplateBySlug = (slug: string) => sampleItems.find((i) => (i.slug ?? i.id) === slug && i.type === "template");

export const revalidate = 300;

type TemplateView = {
  id: string;
  slug?: string;
  title: string;
  description: string | null;
  body: string;
  tags: string[];
  stats: { views: number; copies: number; votes: number };
  badge?: string;
};

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
    description: item.description ?? "",
  };
}

export default async function TemplateDetail({
  params,
}: {
  params: Promise<TemplateParams>;
}) {
  const { slug } = await params;
  const template: PublicTemplate | null = await getPublicTemplate(slug);
  const fallback = findTemplateBySlug(slug);
  const data: TemplateView | null = template
    ? {
        id: template.id,
        slug: template.slug,
        title: template.title,
        description: template.description ?? "",
        body: template.body ?? "",
        tags: template.tags,
        stats: { views: template.stats.views, copies: template.stats.copies, votes: template.stats.uses ?? 0 },
        badge: (template as { badge?: string }).badge,
      }
    : fallback
      ? {
          id: fallback.id,
          slug: fallback.slug,
          title: fallback.title,
          description: fallback.description ?? "",
          body: fallback.description ?? "",
          tags: fallback.tags,
          stats: { views: fallback.stats.views, copies: fallback.stats.copies, votes: fallback.stats.votes },
          badge: fallback.badge,
        }
      : null;

  if (!data) return notFound();

  const fields: TemplateField[] =
    Array.isArray((template as { fields?: TemplateField[] } | null)?.fields) && template
      ? (template.fields as TemplateField[])
      : [];
  const body = data.body ?? "";
  const tags = normalizeTags(data.tags ?? [], { strict: false }).tags;
  const stats = data.stats ?? { views: 0, copies: 0, votes: 0 };

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
    ? relatedPublic.filter((rel) => rel.id !== data.id).map(toCard).slice(0, 3)
    : sampleItems.filter((i) => i.type === "template" && i.id !== data.id).slice(0, 3);

  const initialValues = Object.fromEntries(fields.map((f) => [f.name, f.placeholder ?? (f.required ? "" : "")]));
  const initialRendered = renderTemplateBody(body, initialValues);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Breadcrumb
        segments={[
          { href: "/", label: "Home" },
          { href: "/templates", label: "Templates" },
          { label: data.title },
        ]}
      />

      <Card className="space-y-3 p-5 sticky top-16 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pill tone="blue">Template</Pill>
              {data.badge && <Pill tone="yellow">{data.badge}</Pill>}
            </div>
            <h1 className="text-display leading-tight">{data.title}</h1>
            <p className="text-body text-mdt-muted max-w-3xl">{data.description}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Pill key={tag} tone="gray">#{tag}</Pill>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TemplateActions id={data.id} slug={data.slug} title={data.title} rendered={initialRendered} />
            <div className="flex gap-3 text-xs text-mdt-muted">
              <span aria-label="Views">📄 {stats.views.toLocaleString()}</span>
              <span aria-label="Copies">📋 {stats.copies.toLocaleString()}</span>
              <span aria-label="Votes">👍 {stats.votes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      <TemplateFormPreview title={data.title} body={body} fields={fields} />

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
            <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{data.title}</p>
          </div>
          <TemplateActions id={data.id} slug={data.slug} title={data.title} rendered={initialRendered} />
        </div>
      </div>
    </main>
  );
}
