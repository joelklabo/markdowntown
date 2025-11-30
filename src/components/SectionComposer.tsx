"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Pluggable } from "unified";
import { Button } from "./ui/Button";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <p className="text-sm text-zinc-500">Loading preview…</p>,
});

type Section = {
  id: string;
  title: string;
  content: string;
  order: number;
};

const emptySelection: Section = {
  id: "",
  title: "",
  content: "",
  order: 0,
};

export function SectionComposer() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<Section | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remarkGfm, setRemarkGfm] = useState<Pluggable | null>(null);

  useEffect(() => {
    import("remark-gfm").then((mod) => {
      const plugin =
        (mod as { default?: Pluggable }).default ?? (mod as unknown as Pluggable);
      setRemarkGfm(plugin);
    });
  }, []);

  const combinedMarkdown = useMemo(() => {
    return sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => s.content || `# ${s.title || "Untitled"}`)
      .join("\n\n");
  }, [sections]);

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sections");
      if (!res.ok) {
        throw new Error(`Failed to load sections (${res.status})`);
      }
      const data: Section[] = await res.json();
      setSections(data);
      setSelected(data[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load sections");
    } finally {
      setLoading(false);
    }
  }

  async function createSection() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled section",
          content: "",
        }),
      });
      if (!res.ok) throw new Error("Could not create section");
      const created: Section = await res.json();
      setSections((prev) => [...prev, created]);
      setSelected(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveSection(next: Section) {
    if (!next.id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/sections/${next.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: next.title,
          content: next.content,
        }),
      });
      if (!res.ok) throw new Error("Could not save section");
      const updated: Section = await res.json();
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelected(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSection(id: string) {
    if (!id) return;
    if (!window.confirm("Delete this section? This cannot be undone.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete section");
      setSections((prev) => prev.filter((s) => s.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  function updateSelected(partial: Partial<Section>) {
    setSelected((prev) => {
      const next = { ...(prev ?? emptySelection), ...partial };
      setSections((existing) =>
        existing.map((s) => (s.id === next.id ? next : s))
      );
      return next;
    });
  }

  const panelClass =
    "composer-panel rounded-2xl border border-mdt-border bg-white shadow-sm transition duration-mdt-base ease-mdt-emphasized hover:shadow-mdt-md focus-within:border-[#bfd4ff] focus-within:shadow-mdt-md dark:bg-mdt-bg-soft-dark dark:border-mdt-border-dark dark:hover:shadow-mdt-sm";

  return (
    <div className="composer-grid grid grid-cols-1 gap-6 lg:grid-cols-[320px_1.1fr_1.1fr]">
      <div className={panelClass} aria-live="polite" aria-busy={isLoading}>
        <div className="flex items-center justify-between border-b border-mdt-border px-4 py-3 dark:border-mdt-border-dark">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-mdt-text-dark">Sections</h2>
          <Button
            onClick={createSection}
            disabled={saving}
            size="sm"
            aria-label="Add a new section"
          >
            Add
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-2 py-2" role="list">
          {isLoading && (
            <p className="px-2 py-2 text-sm text-zinc-500" role="status">
              Loading...
            </p>
          )}
          {!isLoading && sections.length === 0 && (
            <p className="px-2 py-2 text-sm text-zinc-500">
              No sections yet. Create your first one.
            </p>
          )}
          {sections.map((section, idx) => (
            <div role="listitem" key={section.id}>
              <button
                onClick={() => setSelected(section)}
                style={{ transitionDelay: `${idx * 15}ms` }}
                aria-current={selected?.id === section.id}
                className={`group mb-2 flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition duration-mdt-fast ease-mdt-emphasized focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-mdt-bg-dark ${
                  selected?.id === section.id
                    ? "bg-indigo-50 text-indigo-700 focus-visible:ring-indigo-500 dark:bg-[#1d2f4d] dark:text-mdt-text-dark"
                    : "hover:bg-zinc-50 dark:hover:bg-[#1c273a]"
                }`}
              >
                <span className="truncate text-sm font-medium">{section.title}</span>
                <span className="text-[11px] text-zinc-500" aria-label={`Order ${section.order}`}>
                  #{section.order}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={panelClass} aria-busy={saving}>
        <div className="flex items-center justify-between border-b border-mdt-border px-4 py-3 dark:border-mdt-border-dark">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-800 dark:text-mdt-text-dark">Editor</span>
            <span className="text-xs text-zinc-500 dark:text-mdt-muted-dark">
              Live Markdown saves back to your Section
            </span>
          </div>
          {selected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteSection(selected.id)}
              disabled={saving}
              aria-label={`Delete section ${selected.title || selected.id}`}
              className="text-red-600 hover:text-red-500 dark:text-red-400"
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3 px-4 py-4">
          <input
            type="text"
            placeholder="Section title"
            value={selected?.title ?? ""}
            onChange={(e) =>
              updateSelected({ title: e.target.value ?? "Untitled section" })
            }
            onBlur={() => selected && saveSection(selected)}
            disabled={!selected}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:border-mdt-border-dark dark:bg-mdt-bg-dark dark:text-mdt-text-dark dark:focus:ring-indigo-900"
          />
          <textarea
            placeholder="Write markdown here..."
            value={selected?.content ?? ""}
            onChange={(e) => updateSelected({ content: e.target.value })}
            onBlur={() => selected && saveSection(selected)}
            disabled={!selected}
            rows={18}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:border-mdt-border-dark dark:bg-mdt-bg-dark dark:text-mdt-text-dark dark:focus:ring-indigo-900"
          />
          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between border-b border-mdt-border px-4 py-3 dark:border-mdt-border-dark">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-800 dark:text-mdt-text-dark">
              Preview
            </span>
            <span className="text-xs text-zinc-500 dark:text-mdt-muted-dark">Rendered Markdown</span>
          </div>
        </div>
        <div className="markdown-preview px-4 py-4">
          {combinedMarkdown ? (
            <ReactMarkdown remarkPlugins={remarkGfm ? [remarkGfm] : undefined}>
              {combinedMarkdown}
            </ReactMarkdown>
          ) : (
            <p className="text-sm text-zinc-500">Start typing to see a preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}
