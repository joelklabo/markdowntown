"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import { ForkButton } from "@/components/artifact/ForkButton";
import { PreviewDrawer } from "@/components/library/PreviewDrawer";

export type ArtifactRowItem = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  tags: string[];
  targets: string[];
  hasScopes: boolean;
  stats: { views: number; copies: number; votes: number };
  type: "snippet" | "template" | "file" | "agent";
};

function typeLabel(type: ArtifactRowItem["type"]) {
  if (type === "snippet") return "Snippet";
  if (type === "template") return "Template";
  if (type === "file") return "File";
  return "Artifact";
}

export function ArtifactRow({ item }: { item: ArtifactRowItem }) {
  const [copied, setCopied] = React.useState(false);
  const slugOrId = item.slug ?? item.id;
  const detailHref = `/a/${slugOrId}`;

  async function handleCopy() {
    try {
      const url = `${window.location.origin}${detailHref}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.warn("copy failed", err);
    }
  }

  return (
    <div
      data-testid="artifact-row"
      className={cn(
        "flex flex-col gap-mdt-3 rounded-mdt-lg border border-mdt-border bg-mdt-surface p-mdt-4 shadow-mdt-sm",
        "sm:flex-row sm:items-start sm:justify-between"
      )}
    >
      <div className="min-w-0 flex-1 space-y-mdt-2">
        <div className="flex flex-wrap items-center gap-mdt-2">
          <Pill tone="blue">{typeLabel(item.type)}</Pill>
          {item.hasScopes ? <Pill tone="green">Scopes</Pill> : null}
          {item.targets.slice(0, 3).map((t) => (
            <Pill key={t} tone="gray">
              {t}
            </Pill>
          ))}
        </div>

        <div className="space-y-mdt-1">
          <Link href={detailHref} className="block">
            <div className="text-body font-semibold text-mdt-text truncate">{item.title}</div>
          </Link>
          <div className="text-body-sm text-mdt-muted line-clamp-2">{item.description}</div>
        </div>

        <div className="flex flex-wrap gap-mdt-2">
          {item.tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-mdt-pill border border-mdt-border bg-mdt-surface-subtle px-mdt-2 py-[2px] text-caption text-mdt-muted"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-mdt-3 text-caption text-mdt-muted">
          <span>{item.stats.views.toLocaleString()} views</span>
          <span>{item.stats.copies.toLocaleString()} copies</span>
          <span>{item.stats.votes.toLocaleString()} votes</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-mdt-2">
        <PreviewDrawer artifactId={item.id} title={item.title} targets={item.targets} />
        <Button size="xs" variant="secondary" onClick={handleCopy} aria-label={`Copy link for ${item.title}`}>
          {copied ? "Copied" : "Copy"}
        </Button>
        <ForkButton artifactId={item.id} size="xs" label="Fork" />
        <Button size="xs" asChild>
          <Link href={`/workbench?id=${item.id}`}>Open Workbench</Link>
        </Button>
      </div>
    </div>
  );
}
