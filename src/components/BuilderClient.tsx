"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";

type Template = { id: string; title: string; description?: string; body: string; tags: string[] };
type Snippet = { id: string; title: string; content: string; tags: string[] };

type Props = {
  templates: Template[];
  snippets: Snippet[];
  requireAuth?: boolean;
};

export function BuilderClient({ templates, snippets, requireAuth }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templates[0]?.id ?? null);
  const [selectedSnippets, setSelectedSnippets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rendered = useMemo(() => {
    const parts: string[] = [];
    const template = templates.find((t) => t.id === selectedTemplate);
    if (template) {
      parts.push(`# ${template.title}\n\n${template.body || template.description || ""}`.trim());
    }
    selectedSnippets.forEach((id) => {
      const snip = snippets.find((s) => s.id === id);
      if (snip) {
        parts.push(`## ${snip.title}\n\n${snip.content}`.trim());
      }
    });
    return parts.join("\n\n");
  }, [selectedTemplate, selectedSnippets, templates, snippets]);

  function toggleSnippet(id: string) {
    setSelectedSnippets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function moveSnippet(id: string, dir: -1 | 1) {
    setSelectedSnippets((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function copyMarkdown() {
    if (!rendered) return;
    await navigator.clipboard.writeText(rendered);
  }

  async function saveDocument() {
    if (requireAuth) {
      window.location.href = "/api/auth/signin?callbackUrl=/builder";
      return;
    }
    const title = prompt("Name this agents.md", "My agents.md");
    if (!title) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: `Built from ${selectedSnippets.length} snippets`,
        renderedContent: rendered,
        tags: ["agents", "builder"],
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }
    const doc = await res.json();
    setSaving(false);
    window.location.href = `/documents/${doc.id}`;
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-caption text-mdt-muted">Builder</p>
          <h1 className="text-display">Assemble your agents.md</h1>
          <p className="text-body text-mdt-muted max-w-2xl">
            Pick a template, add snippets, reorder, then copy, download, or save as a document.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href="/browse">Browse library</Link>
          </Button>
          <Button asChild>
            <Link href={requireAuth ? "/api/auth/signin?callbackUrl=/builder" : "/documents"}>Your documents</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_320px_1fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h3">Templates</h3>
            <Pill tone="yellow">Pick one</Pill>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                data-testid="builder-template"
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
                <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark line-clamp-2">{tpl.description}</p>
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
                <div key={snip.id} className="flex items-start gap-2">
                  <button
                    data-testid="builder-snippet"
                    onClick={() => toggleSnippet(snip.id)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      active
                        ? "border-indigo-400 bg-indigo-50 dark:bg-[#1d2f4d]"
                        : "border-transparent hover:bg-mdt-bg dark:hover:bg-[#111827]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{snip.title}</span>
                      <Pill tone="gray">{snip.tags[0]}</Pill>
                    </div>
                    <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark line-clamp-2">{snip.content}</p>
                  </button>
                  {active && (
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="sm" onClick={() => moveSnippet(snip.id, -1)} aria-label="Move up">
                        ↑
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => moveSnippet(snip.id, 1)} aria-label="Move down">
                        ↓
                      </Button>
                    </div>
                  )}
                </div>
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
              <Button size="sm" onClick={saveDocument} disabled={!rendered || saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="rounded-lg border border-mdt-border bg-white p-4 font-mono text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark min-h-[300px] whitespace-pre-wrap">
            {rendered || "Select a template and add snippets to see your agents.md."}
          </div>
        </Card>
      </div>
    </main>
  );
}
