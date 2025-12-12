"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LibraryCard } from "@/components/LibraryCard";
import type { SampleItem } from "@/lib/sampleContent";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  initialItems: SampleItem[];
  query: string | null;
  sortParam?: string;
  typeParam?: string;
  activeTags: string[];
};

export function BrowseResults({ initialItems, query, sortParam, typeParam, activeTags }: Props) {
  const [items, setItems] = useState<SampleItem[]>(initialItems);
  const [limit, setLimit] = useState(initialItems.length || 30);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<SampleItem | null>(null);

  const paramsForFetch = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(limit + 30));
    if (query) p.set("q", query);
    if (sortParam) p.set("sort", sortParam);
    if (typeParam) p.set("type", typeParam);
    activeTags.forEach((tag) => p.append("tag", tag));
    return p;
  }, [limit, query, sortParam, typeParam, activeTags]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/items?${paramsForFetch.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load items");
      const data = (await res.json()) as SampleItem[];
      setItems(data);
      setLimit((prev) => prev + 30);
      track("browse_load_more", { count: data.length, sort: sortParam, type: typeParam });
    } catch (err) {
      console.warn("loadMore failed", err);
    } finally {
      setLoading(false);
    }
  }, [paramsForFetch, sortParam, typeParam]);

  async function handleCopy(item: SampleItem) {
    try {
      await navigator.clipboard.writeText(item.description || item.title);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
      track("browse_card_copy", { id: item.id, type: item.type, title: item.title, sort: sortParam, q: query });
    } catch (err) {
      console.warn("copy failed", err);
    }
  }

  function handleBuilder(item: SampleItem) {
    track("browse_card_add_builder", { id: item.id, type: item.type });
    window.location.href = `/builder?add=${item.slug ?? item.id}`;
  }

  function handleDragStart(item: SampleItem) {
    const data = {
      id: item.id,
      slug: item.slug ?? item.id,
      type: item.type,
      title: item.title,
      content: item.description ?? "",
    };
    const payload = JSON.stringify(data);
    // modern browsers
    if (typeof window !== "undefined") {
      window.addEventListener(
        "dragstart",
        (e) => {
          try {
            e.dataTransfer?.setData("application/json", payload);
          } catch {
            /* noop */
          }
        },
        { once: true }
      );
    }
  }

  function handleDragEnd() {
    /* no-op placeholder for future visual feedback */
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "l" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        void loadMore();
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        const input = document.getElementById("browse-search-input") as HTMLInputElement | null;
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }
      if (e.key === "Escape" && preview) {
        setPreview(null);
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [loadMore, preview]);

  function handleUseTemplate(item: SampleItem) {
    track("browse_card_use_template", { id: item.id });
    window.location.href = `/templates/${item.slug ?? item.id}`;
  }

  function handleDownload(item: SampleItem) {
    track("browse_card_download", { id: item.id });
    window.location.href = `/files/${item.slug ?? item.id}`;
  }

  if (!items.length) {
    return (
      <div className="rounded-mdt-lg border border-mdt-border bg-mdt-surface p-6 text-center text-mdt-muted">
        <p className="text-body">No results yet.</p>
        <p className="text-body-sm mt-1">Try clearing filters, using fewer tags, or checking “All” types.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-mdt-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
      {items.map((item) => (
        <LibraryCard
          key={item.id}
          item={item}
          copied={copiedId === item.id}
          onCopySnippet={item.type === "snippet" ? handleCopy : undefined}
          onAddToBuilder={item.type !== "file" ? handleBuilder : undefined}
          onUseTemplate={item.type === "template" ? handleUseTemplate : undefined}
          onDownloadFile={item.type === "file" ? handleDownload : undefined}
          onPreview={
            item.type !== "file"
              ? (it) => {
                  setPreview(it);
                  track("browse_preview_open", { id: it.id, type: it.type, sort: sortParam, q: query });
                }
              : undefined
          }
          draggable
          onDragStart={() => handleDragStart(item)}
          onDragEnd={handleDragEnd}
        />
      ))}
      <div className="sm:col-span-2 lg:col-span-3 flex justify-center">
        <Button variant="secondary" size="sm" onClick={loadMore} disabled={loading}>
          {loading ? "Loading…" : "Load more"}
        </Button>
      </div>
      {preview && (
        <div className="fixed inset-0 z-40 bg-[color:var(--mdt-color-overlay)] backdrop-blur-sm motion-fade-in">
          <div className="absolute inset-0" onClick={() => setPreview(null)} aria-label="Close preview" />
          <div className="pointer-events-auto motion-slide-up absolute inset-x-4 top-[10vh] max-h-[80vh] overflow-y-auto rounded-mdt-lg border border-mdt-border bg-mdt-surface p-5 shadow-mdt-lg md:inset-x-1/4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-caption text-mdt-muted uppercase tracking-wide">{preview.type}</p>
                <h2 className="text-h2">{preview.title}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)} aria-label="Close preview">
                Close
              </Button>
            </div>
            <p className="mt-2 text-body text-mdt-muted">{preview.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {preview.tags.map((tag) => (
                <span key={tag} className="rounded-mdt-pill bg-mdt-surface-subtle px-2 py-1 text-xs text-mdt-text">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-3 text-sm text-mdt-muted sm:grid-cols-3">
              <Stat label="Views" value={preview.stats.views} />
              <Stat label="Copies" value={preview.stats.copies} />
              <Stat label="Votes" value={preview.stats.votes} />
            </div>
            <div className="mt-4 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-4 text-sm text-mdt-text">
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => setPreview(null)}>
                Close
              </Button>
              {preview.type !== "file" && (
                <Button variant="secondary" size="sm" onClick={() => handleBuilder(preview)}>
                  Add to builder
                </Button>
              )}
              {preview.type === "template" && (
                <Button size="sm" onClick={() => handleUseTemplate(preview)}>
                  Use template
                </Button>
              )}
              {preview.type === "file" && (
                <Button size="sm" onClick={() => handleDownload(preview)}>
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-3 py-2">
      <p className="text-caption text-mdt-muted">{label}</p>
      <p className="text-body font-semibold text-mdt-text">{value.toLocaleString()}</p>
    </div>
  );
}
