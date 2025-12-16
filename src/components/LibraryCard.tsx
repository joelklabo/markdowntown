import Link from "next/link";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { Card } from "./ui/Card";
import { Heading } from "./ui/Heading";
import { Row, Stack } from "./ui/Stack";
import { Text } from "./ui/Text";
import { cn } from "@/lib/cn";

// Compatible with SampleItem for now, but prefer PublicItem
type Item = {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  tags: string[];
  stats: { views: number; copies: number; votes: number };
  type: string; // relax type check or use PublicItemType
  badge?: "new" | "trending" | "staff";
};

function badgeLabel(badge?: Item["badge"]) {
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
  onCopySnippet?: (item: Item) => void;
  onUseTemplate?: (item: Item) => void;
  onAddToBuilder?: (item: Item) => void;
  onDownloadFile?: (item: Item) => void;
  onPreview?: (item: Item) => void;
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
  draggable,
  onDragStart,
  onDragEnd,
  className,
  ...rest
}: { item: Item } & Handlers & React.HTMLAttributes<HTMLDivElement>) {
  const badge = badgeLabel(item.badge);
  const typeLabel = item.type === "snippet" ? "Snippet" : item.type === "template" ? "Template" : item.type === "agent" ? "Agent" : "File";
  const slug = item.slug ?? item.id;
  const detailHref =
    item.type === "template"
      ? `/templates/${slug}`
      : item.type === "file"
        ? `/files/${slug}`
        : `/snippets/${slug}`; // What about agent? /agents/${slug}?

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
        <Button size="xs" onClick={() => onCopySnippet(item)} aria-label={`Copy ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    if (item.type === "template" && onUseTemplate) {
      return (
        <Button size="xs" onClick={() => onUseTemplate(item)} aria-label={`Use template ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    if (item.type === "file" && onDownloadFile) {
      return (
        <Button size="xs" onClick={() => onDownloadFile(item)} aria-label={`Download ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    // Agent primary action? Maybe "Fork"? Or "View"?
    // For now View.
    return (
      <Button size="xs" asChild>
        <Link href={primaryAction.href}>{primaryAction.label}</Link>
      </Button>
    );
  };


  const renderSecondary = () => {
    if (!secondaryAction) return null;
    if (onAddToBuilder) {
      return (
        <Button variant="secondary" size="xs" onClick={() => onAddToBuilder(item)} aria-label={`Add ${item.title} to builder`}>
          {secondaryAction.label}
        </Button>
      );
    }
    return (
      <Button variant="secondary" size="xs" asChild>
        <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
      </Button>
    );
  };

  return (
    <Card
      data-testid="library-card"
      className={cn(
        "flex h-full flex-col justify-between",
        className
      )}
      {...rest}
    >
      <Stack gap={3}>
        <Row gap={2} align="center" wrap>
          <Pill tone="blue">{typeLabel}</Pill>
          {badge && <Pill tone={badge.tone}>{badge.label}</Pill>}
          {draggable && (
            <button
              type="button"
              draggable
              onDragStart={onDragStart as React.DragEventHandler<HTMLButtonElement> | undefined}
              onDragEnd={onDragEnd as React.DragEventHandler<HTMLButtonElement> | undefined}
              className="ml-auto inline-flex cursor-grab select-none items-center rounded-mdt-sm border border-mdt-border bg-mdt-surface px-2 py-[2px] text-caption text-mdt-muted hover:border-mdt-border-strong hover:text-mdt-text active:cursor-grabbing"
              aria-label="Drag card to builder"
              onClick={(e) => e.stopPropagation()}
            >
              Drag
            </button>
          )}
        </Row>

        <Stack gap={1}>
          <Heading level="h3" className="leading-tight">
            {item.title}
          </Heading>
          <Text size="bodySm" tone="muted" className="line-clamp-3">
            {item.description}
          </Text>
        </Stack>

        <Row gap={1} wrap>
          {item.tags.map((tag) => (
            <Pill key={tag} tone="gray">
              #{tag}
            </Pill>
          ))}
        </Row>
      </Stack>

      <Row gap={2} align="center" justify="between" className="mt-mdt-4 text-caption text-mdt-muted">
        <Row gap={2} wrap>
          <Text as="span" size="caption" tone="muted">
            {item.stats.views.toLocaleString()} views
          </Text>
          <Text as="span" size="caption" tone="muted">
            {item.stats.copies.toLocaleString()} copies
          </Text>
          <Text as="span" size="caption" tone="muted">
            {item.stats.votes.toLocaleString()} votes
          </Text>
        </Row>
        <Row gap={2} align="center" className="relative z-10">
          {onPreview && (
            <Button variant="ghost" size="xs" onClick={() => onPreview(item)} aria-label={`Preview ${item.title}`}>
              Preview
            </Button>
          )}
          {renderPrimary()}
          {renderSecondary()}
        </Row>
      </Row>
    </Card>
  );
}
