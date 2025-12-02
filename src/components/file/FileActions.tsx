"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

type Props = {
  id: string;
  slug?: string;
  title: string;
  content: string;
  builderHref?: string;
};

export function FileActions({ id, slug, title, content, builderHref }: Props) {
  const filename = `${slug ?? id}.md`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      track("file_copy", { id, slug, title });
    } catch (err) {
      console.warn("file copy failed", err);
    }
  }

  function download() {
    try {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      track("file_download", { id, slug, title });
    } catch (err) {
      console.warn("file download failed", err);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={copy}>
        Copy
      </Button>
      <Button variant="secondary" size="sm" onClick={download}>
        Download
      </Button>
      {builderHref && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={builderHref}>Clone to builder</Link>
        </Button>
      )}
    </div>
  );
}
