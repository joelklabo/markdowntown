'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import { TextArea } from '@/components/ui/TextArea';
import { Text } from '@/components/ui/Text';
import { emitCityWordmarkEvent } from '@/components/wordmark/sim/bridge';

interface TranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
}

export function TranslateInput({ value, onChange, disabled, helperText }: TranslateInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const readFile = useCallback(
    async (file: File) => {
      const text = await file.text();
      setFileName(file.name);
      onChange(text);
      emitCityWordmarkEvent({ type: 'upload', kind: 'file' });
    },
    [onChange]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      await readFile(file);
    },
    [readFile]
  );

  return (
    <Surface padding="lg" className="space-y-mdt-4">
      <div className="flex flex-wrap items-center justify-between gap-mdt-3">
        <div className="space-y-mdt-1">
          <Text size="caption" tone="muted">Input</Text>
          <Text size="bodySm" tone="muted">
            Paste Markdown or UAM v1 JSON. You can also drop a file into this panel.
          </Text>
        </div>
        <div className="flex items-center gap-mdt-2">
          {fileName && (
            <Text size="caption" tone="muted" className="max-w-[220px] truncate">
              {fileName}
            </Text>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await readFile(file);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Choose file
          </Button>
        </div>
      </div>

      <div
        className="space-y-mdt-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[320px] font-mono text-body-sm resize-none"
          placeholder="Paste Markdown or UAM v1 JSON…"
          disabled={disabled}
          aria-label="Input content"
        />
        {helperText && (
          <Text size="caption" tone="muted">
            {helperText}
          </Text>
        )}
        <Text size="caption" tone="muted">
          Tip: drag and drop a single file anywhere in this panel.
        </Text>
      </div>
    </Surface>
  );
}
