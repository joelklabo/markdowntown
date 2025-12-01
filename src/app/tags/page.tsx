import { sampleTags } from "@/lib/sampleContent";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags | MarkdownTown",
  description: "Explore tags to find snippets, templates, and agents.md files by topic.",
};

export default function TagsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-caption text-mdt-muted">Tags</p>
        <h1 className="text-display">Topics people are using right now</h1>
        <p className="text-body text-mdt-muted max-w-2xl">
          Choose a tag to jump into related snippets, templates, and agents.md files.
        </p>
      </div>

      <Card className="flex flex-wrap gap-3">
        {sampleTags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/browse?tag=${encodeURIComponent(tag)}`}
            className="rounded-lg border border-mdt-border px-3 py-2 text-sm text-mdt-text transition hover:-translate-y-[1px] hover:border-indigo-300 hover:shadow-mdt-sm dark:border-mdt-border-dark dark:text-mdt-text-dark"
          >
            <span className="font-semibold">#{tag}</span>
            <span className="ml-2 text-mdt-muted dark:text-mdt-muted-dark">{count} items</span>
          </Link>
        ))}
      </Card>
    </main>
  );
}
