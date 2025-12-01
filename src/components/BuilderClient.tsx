"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { sampleItems } from "@/lib/sampleContent";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";

const templates = sampleItems.filter((i) => i.type === "template");
const snippets = sampleItems.filter((i) => i.type === "snippet");

export function BuilderClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templates[0]?.id ?? null);
  const [selectedSnippets, setSelectedSnippets] = useState<string[]>([]);

  const rendered = useMemo(() => {
    const parts: string[] = [];
    const template = templates.find((t) => t.id === selectedTemplate);
    if (template) {
      parts.push(`# Template: ${template.title}\n\n${template.description}`);
    }
    selectedSnippets.forEach((id) => {
      const snip = snippets.find((s) => s.id === id);
      if (snip) {
        parts.push(`## ${snip.title}\n\n${snip.description}`);
      }
    });
    return parts.join("\n\n");
  }, [selectedTemplate, selectedSnippets]);

  function toggleSnippet(id: string) {
    setSelectedSnippets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function copyMarkdown() {
    if (!rendered) return;
    void navigator.clipboard.writeText(rendered);
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-caption text-mdt-muted">Builder</p>
          <h1 className="text-display">Assemble your agents.md</h1>
          <p className="text-body text-mdt-muted max-w-2xl">
            Pick a template, add snippets, reorder later. Copy or download instantly; sign in only when you want to save.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href="/browse">Browse library</Link>
          </Button>
          <Button asChild>
            <Link href="/api/auth/signin?callbackUrl=/builder">Sign in to save</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_320px_1fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h3">Templates</h3>
            <Pill tone="yellow">New</Pill>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  selectedTemplate === tpl.id
                    ? "border-indigo-400 bg-indigo-50 dark:bg-[#1d2f4d]"
                    : "border-transparent hover:bg-mdt-bg dark:hover:bg-[#111827]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{tpl.title}</span>
                  <Pill tone="gray">{tpl.tags[0]}</Pill>
                </div>
                <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{tpl.description}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h3">Snippets</h3>
            <Pill tone="blue">Add</Pill>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {snippets.map((snip) => {
              const active = selectedSnippets.includes(snip.id);
              return (
                <button
                  key={snip.id}
                  onClick={() => toggleSnippet(snip.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    active
                      ? "border-indigo-400 bg-indigo-50 dark:bg-[#1d2f4d]"
                      : "border-transparent hover:bg-mdt-bg dark:hover:bg-[#111827]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{snip.title}</span>
                    <Pill tone="gray">{snip.tags[0]}</Pill>
                  </div>
                  <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">{snip.description}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h3">Preview</h3>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={copyMarkdown} disabled={!rendered}>
                Copy
              </Button>
              <Button size="sm" asChild>
                <Link href="/api/auth/signin?callbackUrl=/builder">Save</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-mdt-border bg-white p-4 font-mono text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark min-h-[300px] whitespace-pre-wrap">
            {rendered || "Select a template and add snippets to see your agents.md."}
          </div>
        </Card>
      </div>
    </main>
  );
}
