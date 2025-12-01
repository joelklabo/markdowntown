import { sampleItems } from "@/lib/sampleContent";
import { listPublicSections } from "@/lib/publicSections";
import { LibraryCard } from "@/components/LibraryCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse library | MarkdownTown",
  description: "Discover reusable snippets, templates, and agents.md files to assemble your next agents.md.",
};

function sectionToCard(section: { id: string; title: string; content: string; updatedAt: Date }) {
  const description = section.content?.slice(0, 140) || "Markdown snippet";
  return {
    id: section.id,
    title: section.title,
    description,
    tags: [] as string[],
    stats: { copies: 0, views: 0, votes: 0 },
    type: "snippet" as const,
  };
}

export default async function BrowsePage() {
  const sections = await listPublicSections(30);
  const cards = sections.length > 0 ? sections.map(sectionToCard) : sampleItems;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-caption text-mdt-muted">Library</p>
          <h1 className="text-display">Browse snippets, templates, and agents.md files</h1>
          <p className="text-body text-mdt-muted max-w-2xl">
            Copy anything without signing in. Use filters and tags to find the right building blocks, then
            add them to the builder or download directly.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href="/templates">Templates</Link>
          </Button>
          <Button asChild>
            <Link href="/builder">Open builder</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Sort</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Trending", href: "?sort=trending" },
                { label: "New", href: "?sort=new" },
                { label: "Most copied", href: "?sort=copied" },
                { label: "Top rated", href: "?sort=top" },
              ].map((option) => (
                <Pill key={option.label} tone="gray">
                  <Link href={option.href}>{option.label}</Link>
                </Pill>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Types</p>
            <div className="flex flex-wrap gap-2">
              <Pill tone="blue">All</Pill>
              <Pill tone="gray">Snippets</Pill>
              <Pill tone="gray">Templates</Pill>
              <Pill tone="gray">agents.md</Pill>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-mdt-text dark:text-mdt-text-dark">Popular tags</p>
            <div className="flex flex-wrap gap-2">
              {["system", "tools", "templates", "qa", "style", "cli"].map((tag) => (
                <Pill key={tag} tone="gray">#{tag}</Pill>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item) => (
            <LibraryCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
