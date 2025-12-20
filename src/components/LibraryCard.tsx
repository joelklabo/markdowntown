import Link from "next/link";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { Card } from "./ui/Card";
import { Heading } from "./ui/Heading";
import { Row, Stack } from "./ui/Stack";
import { Text } from "./ui/Text";
import { cn } from "@/lib/cn";
import type { SampleItem } from "@/lib/sampleContent";

// Compatible with SampleItem for now, but prefer PublicItem
type Item = SampleItem;

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
  const visibleTags = item.tags.slice(0, 3);
  const overflowCount = item.tags.length - visibleTags.length;
  const actionSize = "sm" as const;
  const detailHref =
    item.type === "template"
      ? `/templates/${slug}`
      : item.type === "file"
        ? `/files/${slug}`
        : item.type === "agent"
          ? `/a/${slug}`
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
        <Button size={actionSize} onClick={() => onCopySnippet(item)} aria-label={`Copy ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    if (item.type === "template" && onUseTemplate) {
      return (
        <Button size={actionSize} onClick={() => onUseTemplate(item)} aria-label={`Use template ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    if (item.type === "file" && onDownloadFile) {
      return (
        <Button size={actionSize} onClick={() => onDownloadFile(item)} aria-label={`Download ${item.title}`}>
          {primaryAction.label}
        </Button>
      );
    }
    // Agent primary action? Maybe "Fork"? Or "View"?
    // For now View.
    return (
      <Button size={actionSize} asChild>
        <Link href={primaryAction.href}>{primaryAction.label}</Link>
      </Button>
    );
  };


  const renderSecondary = () => {
    if (!secondaryAction) return null;
    if (onAddToBuilder) {
      return (
        <Button variant="secondary" size={actionSize} onClick={() => onAddToBuilder(item)} aria-label={`Add ${item.title} to builder`}>
          {secondaryAction.label}
        </Button>
      );
    }
    return (
      <Button variant="secondary" size={actionSize} asChild>
        <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
      </Button>
    );
  };

  return (
    <Card
      data-testid="library-card"
      className={cn(
        "flex h-full flex-col gap-mdt-4 p-mdt-6 motion-reduce:transition-none",
        className
      )}
      {...rest}
    >
      <Stack gap={4}>
        <Row gap={2} align="center" justify="between" wrap>
          <Row gap={2} align="center" wrap>
            <Pill tone="blue">{typeLabel}</Pill>
            {badge && <Pill tone={badge.tone}>{badge.label}</Pill>}
          </Row>
          {draggable && (
            <button
              type="button"
              draggable
              onDragStart={onDragStart as React.DragEventHandler<HTMLButtonElement> | undefined}
              onDragEnd={onDragEnd as React.DragEventHandler<HTMLButtonElement> | undefined}
              className="inline-flex cursor-grab select-none items-center rounded-mdt-pill border border-mdt-border bg-mdt-surface px-mdt-3 py-[4px] text-caption font-medium text-mdt-muted shadow-mdt-sm transition duration-mdt-fast ease-mdt-standard hover:-translate-y-[1px] hover:border-mdt-border-strong hover:text-mdt-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)] active:cursor-grabbing motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              aria-label="Drag card to builder"
              onClick={(e) => e.stopPropagation()}
            >
              Drag
            </button>
          )}
        </Row>

        <Stack gap={2}>
          <Heading level="h3" className="line-clamp-2 leading-tight">
            {item.title}
          </Heading>
          <Text size="bodySm" tone="muted" className="line-clamp-3">
            {item.description}
          </Text>
        </Stack>

        <Row gap={2} wrap>
          {visibleTags.map((tag) => (
            <Pill key={tag} tone="gray">
              #{tag}
            </Pill>
          ))}
          {overflowCount > 0 && (
            <Pill tone="gray">+{overflowCount}</Pill>
          )}
        </Row>
      </Stack>

      <div className="mt-auto space-y-mdt-3 border-t border-mdt-border pt-mdt-4">
        <Row gap={2} wrap className="text-caption text-mdt-muted">
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
        <Row gap={2} align="center" wrap className="relative z-10 w-full justify-start sm:justify-end">
          {onPreview && (
            <Button variant="ghost" size={actionSize} onClick={() => onPreview(item)} aria-label={`Preview ${item.title}`}>
              Preview
            </Button>
          )}
          {renderPrimary()}
          {renderSecondary()}
        </Row>
      </div>
    </Card>
  );
}
