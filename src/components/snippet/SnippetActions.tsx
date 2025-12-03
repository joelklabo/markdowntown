"use client";

import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

type Props = {
  id: string;
  slug?: string;
  title: string;
  content: string;
  variant?: "inline" | "bar";
};

export function SnippetActions({ id, slug, title, content, variant = "inline" }: Props) {
  const href = `/snippets/${slug ?? id}`;
  const builderHref = `/builder?add=${slug ?? id}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      track("snippet_copy", { id, slug, title });
    } catch (err) {
      console.warn("copy failed", err);
    }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin + href : href;
    const titleText = `${title} | MarkdownTown`;
    try {
      if (navigator.share) {
        await navigator.share({ title: titleText, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      track("snippet_share", { id, slug, title });
    } catch (err) {
      console.warn("share failed", err);
    }
  }

  function toBuilder() {
    track("snippet_add_builder", { id, slug, title });
    window.location.href = builderHref;
  }

  function download() {
    try {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug ?? id}.md`;
      a.click();
      URL.revokeObjectURL(url);
      track("snippet_download", { id, slug, title });
    } catch (err) {
      console.warn("download failed", err);
    }
  }

  if (variant === "bar") {
    return (
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={toBuilder}>
          Builder
        </Button>
        <Button size="sm" onClick={copy}>
          Copy
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={copy}>
        Copy
      </Button>
      <Button variant="secondary" size="sm" onClick={download}>
        Download
      </Button>
      <Button variant="ghost" size="sm" onClick={share} aria-label={`Share link to ${title}`}>
        Share
      </Button>
      <Button variant="ghost" size="sm" onClick={toBuilder} aria-label={`Add ${title} to builder`}>
        Add to builder
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <a href={href}>Open detail</a>
      </Button>
    </div>
  );
}
