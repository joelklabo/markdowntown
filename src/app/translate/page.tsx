'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { Container } from '@/components/ui/Container';
import { Stack, Row } from '@/components/ui/Stack';
import { Grid } from '@/components/ui/Grid';
import { Heading } from '@/components/ui/Heading';
import { Checkbox } from '@/components/ui/Checkbox';
import { CompilationResult } from '@/lib/uam/adapters';
import { createZip } from '@/lib/uam/compile/zip';

export default function TranslatePage() {
  const [input, setInput] = useState('');
  const [targets, setTargets] = useState<string[]>(['agents-md']);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectFormat = (text: string) => {
    try {
      const json = JSON.parse(text);
      if (json.kind === 'UniversalAgent') return 'UAM (JSON)';
    } catch {
      // ignore
    }
    return 'Markdown';
  };

  const detected = detectFormat(input);

  const toggleTarget = (t: string) => {
    setTargets(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handleCompile = async () => {
    setLoading(true);
    setError(null);
    try {
      let definition;
      if (detected === 'UAM (JSON)') {
        definition = JSON.parse(input);
      } else {
        // Wrap markdown in simple UAM
        definition = {
            kind: 'UniversalAgent',
            apiVersion: 'v1',
            metadata: { name: 'Translated Agent', version: '1.0.0' },
            blocks: [{ id: 'b1', type: 'instruction', content: input }]
        };
      }

      const res = await fetch('/api/translate/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definition, targets }),
      });

      if (!res.ok) throw new Error('Compilation failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Error compiling');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!result) return;
    const blob = await createZip(result.files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container className="max-w-7xl">
      <Grid columns={2} gap={8} className="h-[calc(100vh-100px)] py-8">
        <Stack gap={4} className="h-full">
           <Heading as="h2">Input</Heading>
           <div className="flex-1 flex flex-col gap-2">
             <TextArea 
               value={input} 
               onChange={(e) => setInput(e.target.value)} 
               className="flex-1 font-mono text-sm resize-none h-full" 
               placeholder="Paste Markdown or UAM JSON..."
             />
             <div className="text-sm text-gray-500">Detected format: {detected}</div>
           </div>
        </Stack>
        <Stack gap={4} className="h-full">
           <Heading as="h2">Output</Heading>
           <Row gap={4} align="center">
              <Checkbox checked={targets.includes('agents-md')} onChange={() => toggleTarget('agents-md')}>
                AGENTS.md
              </Checkbox>
              <Checkbox checked={targets.includes('github-copilot')} onChange={() => toggleTarget('github-copilot')}>
                GitHub Copilot
              </Checkbox>
           </Row>
           <Row gap={4}>
             <Button onClick={handleCompile} disabled={loading || input.trim().length === 0}>
               {loading ? 'Compiling...' : 'Translate / Compile'}
             </Button>
             {result && <Button variant="secondary" onClick={handleDownload}>Download Zip</Button>}
           </Row>
           
           {error && <div className="text-red-500 p-2 border border-red-200 bg-red-50 rounded">{error}</div>}
           
           {result && (
             <div className="flex-1 overflow-auto border p-4 bg-gray-50 dark:bg-gray-900 rounded-md shadow-inner">
                {result.warnings.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <strong className="text-yellow-800 dark:text-yellow-200 block mb-2">Warnings:</strong>
                    <ul className="list-disc pl-5 text-sm text-yellow-700 dark:text-yellow-300">
                      {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
                {result.files.length === 0 && !result.warnings.length && (
                  <div className="text-gray-500 italic">No files generated.</div>
                )}
                {result.files.map(f => (
                  <div key={f.path} className="mb-6 last:mb-0">
                    <h4 className="font-bold mb-2 text-sm text-gray-700 dark:text-gray-300 font-mono">{f.path}</h4>
                    <pre className="text-xs overflow-auto p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded font-mono whitespace-pre-wrap">
                      {f.content}
                    </pre>
                  </div>
                ))}
             </div>
           )}
        </Stack>
      </Grid>
    </Container>
  );
}
