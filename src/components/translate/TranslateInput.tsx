'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { Stack, Row } from '@/components/ui/Stack';

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
    <Stack gap={3} className="h-full">
      <Row gap={2} align="center" className="justify-between">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Input</div>
        <div className="flex items-center gap-2">
          {fileName && <div className="text-xs text-gray-500 truncate max-w-[220px]">{fileName}</div>}
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
      </Row>

      <div
        className="flex-1 flex flex-col gap-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm resize-none h-full"
          placeholder="Paste Markdown or UAM v1 JSON…"
          disabled={disabled}
        />
        {helperText && <div className="text-xs text-gray-500">{helperText}</div>}
        <div className="text-[11px] text-gray-400">
          Tip: drag and drop a single file anywhere in this panel.
        </div>
      </div>
    </Stack>
  );
}

