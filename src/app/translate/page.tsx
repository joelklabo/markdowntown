import { TranslatePageClient } from '@/components/translate/TranslatePageClient';
import { loadExampleText } from '@/lib/atlas/load';

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  return typeof value === 'string' ? value : null;
}

export default async function TranslatePage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const target = firstString(searchParams.target)?.trim() ?? null;
  const example = firstString(searchParams.example)?.trim() ?? null;

  const initialTargets = target && target.length > 0 ? [target] : ['agents-md', 'github-copilot'];

  let initialInput = '';
  let initialError: string | null = null;

  if (example && example.length > 0) {
    try {
      initialInput = loadExampleText(example);
    } catch {
      initialError = `Example not found: ${example}`;
    }
  }

  return (
    <TranslatePageClient initialInput={initialInput} initialTargets={initialTargets} initialError={initialError} />
  );
}

