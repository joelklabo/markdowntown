"use client";

import { useState } from "react";
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
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">
            Title
            <input
              className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">
            Description
            <textarea
              className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </label>
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">
            agents.md content
            <textarea
              className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 font-mono text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
          </label>
          <label className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">
            Tags (comma separated)
            <input
              className="mt-1 w-full rounded-md border border-mdt-border px-3 py-2 text-sm dark:border-mdt-border-dark dark:bg-mdt-bg-dark"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>
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
      </Card>
    </form>
  );
}
