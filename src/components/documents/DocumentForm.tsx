"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Doc = {
  id?: string;
  title: string;
  description?: string | null;
  renderedContent?: string | null;
  tags: string[];
};

type Props = {
  initial?: Doc;
};

export function DocumentForm({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.renderedContent ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<Array<{ id: string; title: string; preview: string }>>([]);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [snippetError, setSnippetError] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string>("");

  useEffect(() => {
    async function loadSnippets() {
      setLoadingSnippets(true);
      try {
        // Prefer the signed-in user's sections so they can re-use their own snippets
        const res = await fetch("/api/sections");
        if (!res.ok) throw new Error(`Failed to load sections (${res.status})`);
        const data = (await res.json()) as Array<{ id: string; title: string; content: string }>;
        const mapped =
          data?.map((item) => ({
            id: item.id,
            title: item.title || "Untitled section",
            preview: (item.content ?? "").trim(),
          })) ?? [];
        setSnippets(mapped);
        if (mapped[0]) setSelectedSnippet(mapped[0].id);
      } catch (err) {
        setSnippetError(err instanceof Error ? err.message : "Unable to load snippets");
      } finally {
        setLoadingSnippets(false);
      }
    }
    loadSnippets();
  }, []);

  function insertSelectedSnippet() {
    const snip = snippets.find((s) => s.id === selectedSnippet);
    if (!snip) return;
    setContent((prev) => `${prev.trim()}\n\n## ${snip.title}\n\n${snip.preview}`.trim());
  }

  async function copyContent() {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.warn("copy failed", err);
    }
  }

  function downloadContent() {
    if (!content.trim()) return;
    try {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "agents"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("download failed", err);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title,
      description,
      renderedContent: content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const url = initial?.id ? `/api/documents/${initial.id}` : "/api/documents";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }
    const data = await res.json();
    router.push(`/documents/${data.id}`);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Card className="space-y-3 p-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark" htmlFor="doc-title">
            Title
          </label>
          <input
            id="doc-title"
            className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label="Document title"
          />
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark" htmlFor="doc-description">
            Description
          </label>
          <textarea
            id="doc-description"
            className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            aria-label="Document description"
          />
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark" htmlFor="agents-md-content">
            agents.md content
          </label>
          <textarea
            id="agents-md-content"
            className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 font-mono text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            aria-label="agents.md content"
          />
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark" htmlFor="doc-tags">
            Tags (comma separated)
          </label>
          <input
            id="doc-tags"
            className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            aria-label="Document tags"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : initial?.id ? "Save changes" : "Create document"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        <div className="rounded-md border border-mdt-border bg-white p-3 shadow-sm space-y-3 dark:border-mdt-border-dark dark:bg-mdt-bg-dark">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Insert snippet</span>
            <select
              value={selectedSnippet}
              onChange={(e) => setSelectedSnippet(e.target.value)}
              disabled={loadingSnippets || snippets.length === 0}
              className="rounded-md border border-mdt-border px-2 py-1 text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark dark:text-mdt-text-dark"
              aria-label="Choose snippet to insert"
            >
              {snippets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              disabled={loadingSnippets || snippets.length === 0}
              onClick={insertSelectedSnippet}
              aria-label="Insert selected snippet into document"
            >
              Insert into document
            </Button>
            {loadingSnippets && <span className="text-xs text-mdt-muted">Loading snippets…</span>}
            {snippetError && <span className="text-xs text-red-600">{snippetError}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={copyContent} disabled={!content.trim()} aria-label="Copy document markdown">
              Copy markdown
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={downloadContent} disabled={!content.trim()} aria-label="Download document markdown">
              Download .md
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
