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

type Handlers = {
  onCopySnippet?: (item: SampleItem) => void;
  onUseTemplate?: (item: SampleItem) => void;
  onAddToBuilder?: (item: SampleItem) => void;
  onDownloadFile?: (item: SampleItem) => void;
  onPreview?: (item: SampleItem) => void;
  copied?: boolean;
};

export function LibraryCard({
  item,
  copied,
  onCopySnippet,
  onUseTemplate,
  onAddToBuilder,
  onDownloadFile,
  onPreview,
  ...rest
}: { item: SampleItem } & Handlers & React.HTMLAttributes<HTMLDivElement>) {
  const badge = badgeLabel(item.badge);
  const typeLabel = item.type === "snippet" ? "Snippet" : item.type === "template" ? "Template" : "agents.md";
  const slug = item.slug ?? item.id;
  const detailHref =
    item.type === "template"
      ? `/templates/${slug}`
      : item.type === "file"
        ? `/files/${slug}`
        : `/snippets/${slug}`;

  const primaryAction =
    item.type === "template"
      ? { label: "Use template", href: `/templates/${slug}` }
      : item.type === "file"
        ? { label: "Download", href: `/files/${slug}` }
        : { label: copied ? "Copied" : "Copy", href: detailHref };

  const secondaryAction =
    item.type === "file"
      ? null
      : { label: "Add to builder", href: `/builder?add=${slug}` };

  const renderPrimary = () => {
    if (item.type === "snippet" && onCopySnippet) {
      return (
        <Button size="sm" onClick={() => onCopySnippet(item)} aria-label={`Copy ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    if (item.type === "template" && onUseTemplate) {
      return (
        <Button size="sm" onClick={() => onUseTemplate(item)} aria-label={`Use template ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    if (item.type === "file" && onDownloadFile) {
      return (
        <Button size="sm" onClick={() => onDownloadFile(item)} aria-label={`Download ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    return (
      <Button size="sm" asChild>
        <Link href={primaryAction.href}>{primaryAction.label}</Link>
      </Button>
    );
  };

  const renderSecondary = () => {
    if (!secondaryAction) return null;
    if (onAddToBuilder) {
      return (
        <Button variant="secondary" size="sm" onClick={() => onAddToBuilder(item)} aria-label={`Add ${item.title} to builder`}>
          {secondaryAction.label}
        </Button>
      );
    }
    return (
      <Button variant="secondary" size="sm" asChild>
        <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
      </Button>
    );
  };

  return (
    <Card
      className="flex h-full flex-col justify-between border border-mdt-border bg-mdt-surface shadow-mdt-md transition hover:-translate-y-[1px] hover:shadow-mdt-glow"
      {...rest}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Pill tone="blue">{typeLabel}</Pill>
          {badge && <Pill tone={badge.tone}>{badge.label}</Pill>}
        </div>
        <div className="space-y-1">
          <h3 className="text-h3 font-display leading-tight text-mdt-text">{item.title}</h3>
          <p className="text-body-sm text-mdt-muted line-clamp-3">{item.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Pill key={tag} tone="gray">
              #{tag}
            </Pill>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-mdt-muted">
        <div className="flex gap-3">
          <span>📄 {item.stats.views.toLocaleString()} views</span>
          <span>📋 {item.stats.copies.toLocaleString()} copies</span>
          <span>👍 {item.stats.votes.toLocaleString()} votes</span>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button variant="ghost" size="sm" onClick={() => onPreview(item)} aria-label={`Preview ${item.title}`}>
              Preview
            </Button>
          )}
          {renderPrimary()}
          {renderSecondary()}
        </div>
      </div>
    </Card>
  );
}
