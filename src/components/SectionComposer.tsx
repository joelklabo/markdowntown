"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1.1fr_1.1fr]">
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-800">Sections</h2>
          <button
            onClick={createSection}
            disabled={saving}
            className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-2 py-2">
          {isLoading && <p className="px-2 py-2 text-sm text-zinc-500">Loading...</p>}
          {!isLoading && sections.length === 0 && (
            <p className="px-2 py-2 text-sm text-zinc-500">
              No sections yet. Create your first one.
            </p>
          )}
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelected(section)}
              className={`group mb-2 flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition ${
                selected?.id === section.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-zinc-50"
              }`}
            >
              <span className="truncate text-sm font-medium">{section.title}</span>
              <span className="text-[11px] text-zinc-500">#{section.order}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-800">Editor</span>
            <span className="text-xs text-zinc-500">
              Live Markdown saves back to your Section
            </span>
          </div>
          {selected && (
            <button
              onClick={() => deleteSection(selected.id)}
              disabled={saving}
              className="text-xs font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
            >
              Delete
            </button>
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
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
          />
          <textarea
            placeholder="Write markdown here..."
            value={selected?.content ?? ""}
            onChange={(e) => updateSelected({ content: e.target.value })}
            onBlur={() => selected && saveSection(selected)}
            disabled={!selected}
            rows={18}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
          />
          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-800">Preview</span>
            <span className="text-xs text-zinc-500">Rendered Markdown</span>
          </div>
        </div>
        <div className="markdown-preview px-4 py-4">
          {combinedMarkdown ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{combinedMarkdown}</ReactMarkdown>
          ) : (
            <p className="text-sm text-zinc-500">Start typing to see a preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}
