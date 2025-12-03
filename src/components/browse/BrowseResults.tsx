"use client";

import { useMemo, useState } from "react";
import { LibraryCard } from "@/components/LibraryCard";
import type { SampleItem } from "@/lib/sampleContent";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

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

  const paramsForFetch = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", String(limit + 30));
    if (query) p.set("q", query);
    if (sortParam) p.set("sort", sortParam);
    if (typeParam) p.set("type", typeParam);
    activeTags.forEach((tag) => p.append("tag", tag));
    return p;
  }, [limit, query, sortParam, typeParam, activeTags]);

  async function loadMore() {
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
  }

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
      <div className="rounded-mdt-lg border border-mdt-border bg-mdt-surface p-6 text-center shadow-mdt-sm text-mdt-muted">
        <p className="text-body">No results yet.</p>
        <p className="text-body-sm mt-1">Try clearing filters, using fewer tags, or checking “All” types.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
      {items.map((item) => (
        <LibraryCard
          key={item.id}
          item={item}
          copied={copiedId === item.id}
          onCopySnippet={item.type === "snippet" ? handleCopy : undefined}
          onAddToBuilder={item.type !== "file" ? handleBuilder : undefined}
          onUseTemplate={item.type === "template" ? handleUseTemplate : undefined}
          onDownloadFile={item.type === "file" ? handleDownload : undefined}
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
    </div>
  );
}
