import { WorkbenchPageClient } from '@/components/workbench/WorkbenchPageClient';
import { loadWorkbenchTemplateUam } from '@/lib/atlas/load';
import type { UamV1 } from '@/lib/uam/uamTypes';

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  return typeof value === 'string' ? value : null;
}

export default async function WorkbenchPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;

  const idOrSlug =
    firstString(searchParams.id)?.trim() ??
    firstString(searchParams.slug)?.trim() ??
    firstString(searchParams.artifact)?.trim() ??
    null;

  const templateId = firstString(searchParams.templateId)?.trim() ?? null;

  let initialTemplateUam: UamV1 | null = null;
  if (!idOrSlug && templateId && templateId.length > 0) {
    try {
      initialTemplateUam = loadWorkbenchTemplateUam(templateId);
    } catch {
      initialTemplateUam = null;
    }
  }

  return <WorkbenchPageClient initialArtifactId={idOrSlug} initialTemplateUam={initialTemplateUam} />;
}

