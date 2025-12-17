import { loadAtlasGuideMdx, listAtlasGuideSlugs } from "@/lib/atlas/load";
import { renderMdx } from "@/lib/mdx/renderMdx";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type RecipeParams = { slug: string };

export default async function AtlasRecipePage({ params }: { params: Promise<RecipeParams> }) {
  const { slug } = await params;

  const slugs = (() => {
    try {
      return listAtlasGuideSlugs("recipes");
    } catch {
      return null;
    }
  })();

  if (!slugs || !slugs.includes(slug)) return notFound();

  const mdx = (() => {
    try {
      return loadAtlasGuideMdx(`recipes/${slug}`);
    } catch {
      return null;
    }
  })();

  if (!mdx) return notFound();

  const content = await renderMdx(mdx);

  return (
    <main className="py-mdt-2">
      <article className="markdown-preview">{content}</article>
    </main>
  );
}

