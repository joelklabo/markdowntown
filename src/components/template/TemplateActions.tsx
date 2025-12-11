"use client";

import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

type Props = {
  id: string;
  slug?: string;
  title: string;
  rendered: string;
  variant?: "inline" | "bar";
};

export function TemplateActions({ id, slug, title, rendered, variant = "inline" }: Props) {
  const detailHref = `/templates/${slug ?? id}`;
  const builderHref = `/builder?template=${slug ?? id}`;
  const actionSize = variant === "bar" ? "sm" : "xs";

  async function copy() {
    try {
      await navigator.clipboard.writeText(rendered);
      track("template_copy", { id, slug, title });
    } catch (err) {
      console.warn("copy failed", err);
    }
  }

  function download() {
    try {
      const blob = new Blob([rendered], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug ?? id}.md`;
      a.click();
      URL.revokeObjectURL(url);
      track("template_download", { id, slug, title });
    } catch (err) {
      console.warn("download failed", err);
    }
  }

  function useBuilder() {
    track("template_use_builder", { id, slug, title });
    window.location.href = builderHref;
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin + detailHref : detailHref;
    const shareTitle = `${title} | MarkdownTown`;
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      track("template_share", { id, slug, title });
    } catch (err) {
      console.warn("share failed", err);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size={actionSize} onClick={copy}>
        Copy
      </Button>
      <Button variant="secondary" size={actionSize} onClick={download}>
        Download
      </Button>
      <Button variant="ghost" size={actionSize} onClick={share} aria-label={`Share ${title}`}>
        Share
      </Button>
      <Button variant="ghost" size={actionSize} onClick={useBuilder}>
        Use in builder
      </Button>
      <Button variant="ghost" size={actionSize} asChild>
        <a href={detailHref}>Open detail</a>
      </Button>
    </div>
  );
}
