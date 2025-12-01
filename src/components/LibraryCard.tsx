import Link from "next/link";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { Card } from "./ui/Card";
import type { SampleItem } from "@/lib/sampleContent";

function badgeLabel(badge?: SampleItem["badge"]) {
  switch (badge) {
    case "new":
      return { label: "New", tone: "green" as const };
    case "trending":
      return { label: "Trending", tone: "yellow" as const };
    case "staff":
      return { label: "Staff pick", tone: "red" as const };
    default:
      return null;
  }
}

export function LibraryCard({ item }: { item: SampleItem }) {
  const badge = badgeLabel(item.badge);
  const typeLabel = item.type === "snippet" ? "Snippet" : item.type === "template" ? "Template" : "agents.md";
  const slug = item.slug ?? item.id;
  const detailHref =
    item.type === "template"
      ? `/templates/${slug}`
      : item.type === "file"
        ? `/files/${slug}`
        : `/snippets/${slug}`;

  return (
    <Card className="flex h-full flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Pill tone="blue">{typeLabel}</Pill>
          {badge && <Pill tone={badge.tone}>{badge.label}</Pill>}
        </div>
        <div className="space-y-1">
          <h3 className="text-h3 leading-tight text-mdt-text dark:text-mdt-text-dark">{item.title}</h3>
          <p className="text-body-sm text-mdt-muted dark:text-mdt-muted-dark">{item.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Pill key={tag} tone="gray">#{tag}</Pill>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-mdt-muted dark:text-mdt-muted-dark">
        <div className="flex gap-3">
          <span>📄 {item.stats.views.toLocaleString()} views</span>
          <span>📋 {item.stats.copies.toLocaleString()} copies</span>
          <span>👍 {item.stats.votes.toLocaleString()} votes</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/builder?add=${slug}`}>Add</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={detailHref}>Copy</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
