import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import Link from "next/link";
import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { id: string } | Promise<{ id: string }> }): Metadata {
  const id = (params as { id: string }).id;
  const item = sampleItems.find((i) => i.id === id && i.type === "file");
  if (!item) return { title: "agents.md not found" };
  return {
    title: `${item.title} | MarkdownTown`,
    description: item.description,
  };
}

export function generateStaticParams() {
  return sampleItems.filter((i) => i.type === "file").map((item) => ({ id: item.id }));
}

export default async function FileDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolved = await params;
  const item = sampleItems.find((i) => i.id === resolved.id && i.type === "file");
  if (!item) return notFound();

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Pill tone="blue">agents.md</Pill>
          {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
        </div>
        <h1 className="text-display leading-tight">{item.title}</h1>
        <p className="text-body text-mdt-muted max-w-3xl">{item.description}</p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Pill key={tag} tone="gray">#{tag}</Pill>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm">Copy</Button>
          <Button variant="secondary" size="sm">Download</Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/builder?clone=${item.id}`}>Clone to builder</Link>
          </Button>
        </div>
        <div className="text-xs text-mdt-muted flex gap-3">
          <span>{item.stats.views.toLocaleString()} views</span>
          <span>{item.stats.copies.toLocaleString()} copies</span>
          <span>{item.stats.votes.toLocaleString()} votes</span>
        </div>
      </div>

      <Card className="space-y-3">
        <h3 className="text-h3">Rendered agents.md</h3>
        <div className="rounded-lg border border-mdt-border bg-white p-4 text-sm leading-6 dark:border-mdt-border-dark dark:bg-mdt-bg-dark min-h-[240px]">
          (Sample content placeholder. Full agents.md rendering will appear here.)
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-h3">Components</h3>
        <ul className="list-disc pl-5 text-sm text-mdt-muted">
          <li>System prompt</li>
          <li>Style guide</li>
          <li>Tools instructions</li>
          <li>Testing checklist</li>
        </ul>
      </Card>
    </main>
  );
}
