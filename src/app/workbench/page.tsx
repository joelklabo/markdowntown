import { WorkbenchPageClient } from '@/components/workbench/WorkbenchPageClient';
import { loadWorkbenchTemplateUam } from '@/lib/atlas/load';
import { getSession } from '@/lib/auth';
import type { SimulatorToolId } from '@/lib/atlas/simulators/types';
import type { UamV1 } from '@/lib/uam/uamTypes';

type SearchParams = Record<string, string | string[] | undefined>;
type ScanContext = {
  tool: SimulatorToolId;
  cwd: string;
  paths: string[];
};

function firstString(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  return typeof value === 'string' ? value : null;
}

const SCAN_TOOL_IDS: SimulatorToolId[] = [
  'github-copilot',
  'copilot-cli',
  'claude-code',
  'gemini-cli',
  'codex-cli',
];

function parseScanContext(searchParams: SearchParams): ScanContext | null {
  const tool = firstString(searchParams.scanTool)?.trim();
  if (!tool || !SCAN_TOOL_IDS.includes(tool as SimulatorToolId)) return null;
  const cwd = firstString(searchParams.scanCwd)?.trim() ?? '';
  const rawPaths = firstString(searchParams.scanPaths);
  let paths: string[] = [];
  if (rawPaths) {
    try {
      const parsed = JSON.parse(rawPaths);
      if (Array.isArray(parsed)) {
        paths = parsed.map((value) => String(value)).filter(Boolean).slice(0, 200);
      }
    } catch {
      paths = [];
    }
  }

  return {
    tool: tool as SimulatorToolId,
    cwd,
    paths,
  };
}

export default async function WorkbenchPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  const idOrSlug =
    firstString(searchParams.id)?.trim() ??
    firstString(searchParams.slug)?.trim() ??
    firstString(searchParams.artifact)?.trim() ??
    null;

  const templateId = firstString(searchParams.templateId)?.trim() ?? null;
  const entry = firstString(searchParams.entry)?.trim() ?? null;

  let initialTemplateUam: UamV1 | null = null;
  if (!idOrSlug && templateId && templateId.length > 0) {
    try {
      initialTemplateUam = loadWorkbenchTemplateUam(templateId);
    } catch {
      initialTemplateUam = null;
    }
  }

  const initialScanContext = parseScanContext(searchParams);

  return (
    <WorkbenchPageClient
      initialArtifactId={idOrSlug}
      initialEntryHint={entry === 'translate' ? 'translate' : null}
      initialTemplateUam={initialTemplateUam}
      initialScanContext={initialScanContext}
      session={session}
    />
  );
}
