'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Grid } from '@/components/ui/Grid';
import { TranslateInput } from '@/components/translate/TranslateInput';
import { TranslateOutput, type TranslateCompileResult } from '@/components/translate/TranslateOutput';
import { safeParseUamV1 } from '@/lib/uam/uamValidate';
import { createZip } from '@/lib/compile/zip';
import { wrapMarkdownAsGlobal, type UamV1 } from '@/lib/uam/uamTypes';

type TranslatePageClientProps = {
  initialInput: string;
  initialTargets: string[];
  initialError: string | null;
};

export function TranslatePageClient({ initialInput, initialTargets, initialError }: TranslatePageClientProps) {
  const [input, setInput] = useState(initialInput);
  const [targets, setTargets] = useState<string[]>(initialTargets);
  const [result, setResult] = useState<TranslateCompileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const detect = (text: string): { label: string; uam: UamV1 } => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return { label: 'Empty', uam: wrapMarkdownAsGlobal('') };
    }

    try {
      const json = JSON.parse(trimmed);
      const parsed = safeParseUamV1(json);
      if (parsed.success) return { label: 'UAM v1 (JSON)', uam: parsed.data };
    } catch {
      // ignore
    }

    return { label: 'Markdown', uam: wrapMarkdownAsGlobal(text) };
  };

  const detected = detect(input);

  const WARN_CHARS = 50_000;
  const MAX_CHARS = 200_000;
  const isTooLarge = input.length > MAX_CHARS;
  const helperText =
    input.length > WARN_CHARS
      ? `Large input (${input.length.toLocaleString()} chars). Paste is limited to ${MAX_CHARS.toLocaleString()} chars.`
      : undefined;

  const toggleTarget = (t: string) => {
    setTargets(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };

  const handleCompile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isTooLarge) {
        setError('Input is too large to compile.');
        return;
      }

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uam: detected.uam,
          targets: targets.map(targetId => ({ targetId })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? 'Compilation failed';
        throw new Error(message);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error compiling');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const blob = await createZip(result.files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'outputs.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating zip');
    }
  };

  return (
    <Container className="max-w-7xl">
      <Grid columns={2} gap={8} className="h-[calc(100vh-100px)] py-8">
        <TranslateInput value={input} onChange={setInput} disabled={loading} helperText={helperText} />
        <TranslateOutput
          targets={targets}
          onToggleTarget={toggleTarget}
          onCompile={handleCompile}
          onDownloadZip={handleDownload}
          loading={loading}
          error={error}
          detectedLabel={detected.label}
          disabledCompile={isTooLarge || input.trim().length === 0}
          result={result}
        />
      </Grid>
    </Container>
  );
}

