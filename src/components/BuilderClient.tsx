"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { cn } from "@/lib/cn";
import { BuilderStatus } from "./BuilderStatus";

type Template = { id: string; title: string; description?: string; body: string; tags: string[] };
type Snippet = { id: string; title: string; content: string; tags: string[] };

type Props = {
  templates: Template[];
  snippets: Snippet[];
  requireAuth?: boolean;
};

export function BuilderClient({ templates, snippets, requireAuth }: Props) {
  const search = useSearchParams();
  const preselectedTemplate = search?.get("template");
  const preselectedSnippets = (search?.get("add") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    preselectedTemplate && templates.some((t) => t.id === preselectedTemplate)
      ? preselectedTemplate
      : templates[0]?.id ?? null
  );
  const [selectedSnippets, setSelectedSnippets] = useState<string[]>(() => {
    const valid = preselectedSnippets.filter((id) => snippets.some((s) => s.id === id));
    return valid.length ? valid : [];
  });
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

  // Outline parsing
  type OutlineNode = { id: string; title: string; level: number; line: number };
  const lines = useMemo(() => rendered.split("\n"), [rendered]);
  const outline: OutlineNode[] = useMemo(() => {
    const nodes: OutlineNode[] = [];
    lines.forEach((line, idx) => {
      const match = /^(#{1,6})\s+(.*)/.exec(line.trim());
      if (!match) return;
      const level = match[1].length;
      const title = match[2].trim();
      nodes.push({ id: `${idx}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, title, level, line: idx });
    });
    return nodes;
  }, [lines]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [draggingOutline, setDraggingOutline] = useState(false);

  useEffect(() => {
    // reset collapse when content changes; defer to avoid synchronous state update warning
    const id = requestAnimationFrame(() => setCollapsed(new Set()));
    return () => cancelAnimationFrame(id);
  }, [rendered]);

  const lineOwner = useMemo(() => {
    const owner: (OutlineNode | null)[] = new Array(lines.length).fill(null);
    let current: OutlineNode | null = null;
    let nextIndex = 0;
    const sorted = [...outline].sort((a, b) => a.line - b.line);
    for (let i = 0; i < lines.length; i++) {
      if (nextIndex < sorted.length && sorted[nextIndex].line === i) {
        current = sorted[nextIndex];
        nextIndex += 1;
      }
      owner[i] = current;
    }
    return owner;
  }, [lines.length, outline]);

  const visibleLines = useMemo(() => {
    return lines.filter((_, idx) => {
      const owner = lineOwner[idx];
      if (!owner) return true;
      if (owner.line === idx) return true;
      return !collapsed.has(owner.id);
    });
  }, [lines, lineOwner, collapsed]);

  const previewRef = useRef<HTMLDivElement | null>(null);

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus?.();
    }
  }

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

  function handleOutlineDragEnd(result: DropResult) {
    setDraggingOutline(false);
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    setSelectedSnippets((prev) => {
      const items = [...prev];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return items;
    });
  }

  async function copyMarkdown() {
    if (!rendered) return;
    await navigator.clipboard.writeText(rendered);
  }

  async function saveDocument() {
    if (requireAuth) {
      window.location.href = "/signin?callbackUrl=/builder";
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

  const steps = ["Template", "Snippets", "Arrange", "Preview", "Export"] as const;
  const [stepIndex, setStepIndex] = useState(0);

  function goStep(next: number) {
    const clamped = Math.max(0, Math.min(next, steps.length - 1));
    setStepIndex(clamped);
    const anchor = document.querySelector(`[data-step-anchor=\"${steps[clamped].toLowerCase()}\"]`) as HTMLElement | null;
    anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 pb-32 pt-6 space-y-6">
      <div className="sticky top-16 z-10 rounded-xl border border-mdt-border bg-white/95 px-4 py-3 shadow-mdt-sm backdrop-blur-md dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark/95">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-mdt-muted dark:text-mdt-muted-dark">
            {steps.map((label, idx) => {
              const active = idx === stepIndex;
              const done = idx < stepIndex;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => goStep(idx)}
                  className={`flex items-center gap-2 rounded-md px-2 py-1 transition ${
                    active
                      ? "bg-mdt-blue text-white"
                      : done
                        ? "bg-mdt-bg text-mdt-text dark:bg-mdt-bg-dark dark:text-mdt-text-dark"
                        : "text-mdt-muted hover:text-mdt-text dark:text-mdt-muted-dark dark:hover:text-mdt-text-dark"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
                    {idx + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 rounded-full bg-mdt-bg dark:bg-mdt-bg-dark">
              <div
                className="h-2 rounded-full bg-mdt-blue transition-all"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                aria-hidden
              />
            </div>
            <span className="text-xs text-mdt-muted dark:text-mdt-muted-dark">
              Step {stepIndex + 1} of {steps.length}
            </span>
          </div>
        </div>
      </div>

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
            <Link href={requireAuth ? "/signin?callbackUrl=/builder" : "/documents"}>Your documents</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_300px_1fr_260px] lg:grid-cols-[300px_300px_1fr]">
        <Card className="space-y-3" data-step-anchor="template">
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
                    ? "border-mdt-info bg-mdt-primary-soft dark:bg-mdt-surface-strong"
                    : "border-transparent hover:bg-mdt-surface-subtle dark:hover:bg-mdt-surface-subtle"
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

        <Card className="space-y-3" data-step-anchor="snippets">
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
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        moveSnippet(snip.id, -1);
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        moveSnippet(snip.id, 1);
                      }
                    }}
                    className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      active
                        ? "border-mdt-info bg-mdt-primary-soft dark:bg-mdt-surface-strong"
                        : "border-transparent hover:bg-mdt-surface-subtle dark:hover:bg-mdt-surface-subtle"
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSnippet(snip.id, -1)}
                        aria-label="Move up"
                        disabled={selectedSnippets.indexOf(snip.id) === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSnippet(snip.id, 1)}
                        aria-label="Move down"
                        disabled={selectedSnippets.indexOf(snip.id) === selectedSnippets.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col gap-3" data-step-anchor="preview">
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
          <div
            ref={previewRef}
            className="rounded-lg border border-mdt-border bg-mdt-surface p-4 font-mono text-sm min-h-[300px] space-y-2"
          >
            {visibleLines.length === 0 && <p className="text-mdt-muted">Select a template and add snippets to see your agents.md.</p>}
            {lines.map((line, idx) => {
              const owner = lineOwner[idx];
              const hidden = owner && owner.line !== idx && collapsed.has(owner.id);
              if (hidden) return null;
              const match = /^(#{1,6})\s+(.*)/.exec(line.trim());
              if (match) {
                const level = match[1].length;
                const title = match[2];
                const id = outline.find((n) => n.line === idx)?.id ?? `h-${idx}`;
                return (
                  <div
                    key={id}
                    id={id}
                    tabIndex={-1}
                    className="font-semibold text-mdt-text"
                    style={{ marginLeft: `${(level - 1) * 8}px` }}
                  >
                    {match[1]} {title}
                  </div>
                );
              }
              return (
                <p key={`line-${idx}`} className="text-mdt-text-muted leading-6">
                  {line || "\u00a0"}
                </p>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-3" data-step-anchor="outline">
          <div className="flex items-center justify-between">
            <h3 className="text-h3">Outline</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setCollapsed(new Set())}>
                Expand all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCollapsed(new Set(outline.map((o) => o.id)))}>
                Collapse all
              </Button>
            </div>
          </div>
          {outline.length === 0 ? (
            <p className="text-sm text-mdt-muted">Headings will appear here once you add a template/snippet.</p>
          ) : (
            <DragDropContext
              onDragStart={() => setDraggingOutline(true)}
              onDragEnd={handleOutlineDragEnd}
            >
              <Droppable droppableId="outline">
                {(provided) => (
                  <div
                    role="tree"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-1"
                  >
                    {outline.map((node, idx) => {
                      const isCollapsed = collapsed.has(node.id);
                      return (
                        <Draggable draggableId={node.id} index={idx} key={node.id} isDragDisabled={node.level === 1}>
                          {(drag) => (
                            <button
                              key={node.id}
                              role="treeitem"
                              aria-level={node.level}
                              aria-expanded={!isCollapsed}
                              aria-selected="false"
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              onClick={() => {
                                jumpTo(node.id);
                              }}
                              onDoubleClick={() => toggleCollapse(node.id)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition",
                                "hover:bg-[color:var(--mdt-color-surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdt-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]",
                                draggingOutline && node.level === 1 ? "opacity-80" : ""
                              )}
                              style={{ paddingLeft: `${(node.level - 1) * 12 + 8}px` }}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  aria-hidden
                                  className={cn(
                                    "inline-flex h-5 w-5 items-center justify-center rounded-md border border-mdt-border text-[11px]",
                                    isCollapsed ? "bg-mdt-surface-subtle" : "bg-mdt-surface-strong"
                                  )}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleCollapse(node.id);
                                  }}
                                >
                                  {isCollapsed ? "+" : "–"}
                                </span>
                                <span className="font-medium text-mdt-text">{node.title}</span>
                              </span>
                              <span className="text-caption text-mdt-muted">#{node.line + 1}</span>
                            </button>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Card>
      </div>
      <BuilderStatus />
    </main>
  );
}
