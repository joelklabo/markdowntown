'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Stack } from '@/components/ui/Stack';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { TranslateInput } from '@/components/translate/TranslateInput';
import { TranslateOutput, type TranslateCompileResult } from '@/components/translate/TranslateOutput';
import { safeParseUamV1 } from '@/lib/uam/uamValidate';
import { createZip } from '@/lib/compile/zip';
import { createUamTargetV1, wrapMarkdownAsGlobal, type UamTargetV1, type UamV1 } from '@/lib/uam/uamTypes';
import { emitCityWordmarkEvent } from '@/components/wordmark/sim/bridge';

type TranslatePageClientProps = {
  initialInput: string;
  initialTargets: UamTargetV1[];
  initialError: string | null;
};

export function TranslatePageClient({ initialInput, initialTargets, initialError }: TranslatePageClientProps) {
  const [input, setInput] = useState(initialInput);
  const [targets, setTargets] = useState<UamTargetV1[]>(initialTargets);
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
    setTargets((prev) =>
      prev.some((entry) => entry.targetId === t)
        ? prev.filter((entry) => entry.targetId !== t)
        : [...prev, createUamTargetV1(t)]
    );
  };

  const updateTarget = (targetId: string, patch: Partial<Omit<UamTargetV1, 'targetId'>>) => {
    setTargets((prev) =>
      prev.map((entry) => (entry.targetId === targetId ? { ...entry, ...patch } : entry))
    );
  };

  const handleCompile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isTooLarge) {
        setError('Input is too large to compile.');
        emitCityWordmarkEvent({ type: 'alert', kind: 'ambulance' });
        return;
      }

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uam: detected.uam,
          targets,
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
      emitCityWordmarkEvent({ type: 'alert', kind: 'ambulance' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const downloadName =
        targets.length === 1
          ? `${targets[0].targetId}.zip`
          : targets.length > 1
            ? `translate-${targets.map((target) => target.targetId).join('-')}.zip`
            : 'translate-output.zip';
      const blob = await createZip(result.files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating zip');
      emitCityWordmarkEvent({ type: 'alert', kind: 'ambulance' });
    }
  };

  return (
    <Container size="xl" padding="lg" className="py-mdt-10 md:py-mdt-12">
      <Stack gap={8}>
        <Stack gap={3} className="max-w-2xl">
          <Text size="caption" tone="muted">Translate</Text>
          <Heading level="display" leading="tight">Translate markdown into agent-ready formats</Heading>
          <Text tone="muted" leading="relaxed">
            Paste Markdown or UAM JSON, choose your targets, and compile into ready-to-ship instruction files.
          </Text>
        </Stack>

        <div className="flex flex-wrap items-center gap-mdt-4 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-4 py-mdt-3">
          <Text size="caption" tone="muted" className="uppercase tracking-wide">
            Steps
          </Text>
          <Text size="bodySm" tone="muted">1. Select targets</Text>
          <Text size="bodySm" tone="muted">2. Paste input</Text>
          <Text size="bodySm" tone="muted">3. Compile + download</Text>
        </div>

        <div className="grid gap-mdt-6 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)] lg:items-start">
          <TranslateInput value={input} onChange={setInput} disabled={loading} helperText={helperText} />
          <TranslateOutput
            targets={targets}
            onToggleTarget={toggleTarget}
            onUpdateTarget={updateTarget}
            onCompile={handleCompile}
            onDownloadZip={handleDownload}
            loading={loading}
            error={error}
            detectedLabel={detected.label}
            disabledCompile={isTooLarge || input.trim().length === 0}
            result={result}
          />
        </div>
      </Stack>
    </Container>
  );
}
