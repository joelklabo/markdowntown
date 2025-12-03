import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FileActions } from "@/components/file/FileActions";
import { DetailTabs } from "@/components/detail/DetailTabs";
import { DetailStats } from "@/components/detail/DetailStats";
import { DetailWarning } from "@/components/detail/DetailWarning";
import { FeedbackCTA } from "@/components/detail/FeedbackCTA";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
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

export default async function FileDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = sampleItems.find((i) => i.id === id && i.type === "file");
  if (!item) return notFound();

  const renderedContent = [
    `# ${item.title}`,
    "",
    item.description,
    "",
    "## Components",
    "- System prompt",
    "- Style guide",
    "- Tools instructions",
    "- Testing checklist",
  ]
    .filter(Boolean)
    .join("\n");

  const visibility: "PUBLIC" | "PRIVATE" | "UNLISTED" = "PUBLIC";

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Breadcrumb
        segments={[
          { href: "/", label: "Home" },
          { href: "/browse", label: "Browse" },
          { label: item.title },
        ]}
      />
      <div className="space-y-3">
        <DetailWarning visibility={visibility} type="file" />

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
        <FileActions
          id={item.id}
          slug={item.slug ?? item.id}
          title={item.title}
          content={renderedContent}
          builderHref={`/builder?clone=${item.id}`}
        />
        <DetailStats views={item.stats.views} copies={item.stats.copies} votes={item.stats.votes} />
      </div>

      <DetailTabs title={item.title} rendered={renderedContent} raw={renderedContent} copyLabel="Copy" />

      <Card className="space-y-3">
        <h3 className="text-h3">Components</h3>
        <ul className="list-disc pl-5 text-sm text-mdt-muted">
          <li>System prompt</li>
          <li>Style guide</li>
          <li>Tools instructions</li>
          <li>Testing checklist</li>
        </ul>
      </Card>

      <FeedbackCTA title="agents.md file" />
    </main>
  );
}
