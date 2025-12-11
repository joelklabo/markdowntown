import Link from "next/link";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { Card } from "./ui/Card";
import { Heading } from "./ui/Heading";
import { Row, Stack } from "./ui/Stack";
import { Text } from "./ui/Text";
import { cn } from "@/lib/cn";
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
  className,
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
      className={cn(
        "flex h-full flex-col justify-between shadow-mdt-md hover:shadow-mdt-glow",
        className
      )}
      {...rest}
    >
      <Stack gap={3}>
        <Row gap={2} align="center" wrap>
          <Pill tone="blue">{typeLabel}</Pill>
          {badge && <Pill tone={badge.tone}>{badge.label}</Pill>}
        </Row>

        <Stack gap={1}>
          <Heading level="h3" className="leading-tight">
            {item.title}
          </Heading>
          <Text size="bodySm" tone="muted" className="line-clamp-3">
            {item.description}
          </Text>
        </Stack>

        <Row gap={2} wrap>
          {item.tags.map((tag) => (
            <Pill key={tag} tone="gray">
              #{tag}
            </Pill>
          ))}
        </Row>
      </Stack>

      <Row gap={3} align="center" justify="between" className="mt-mdt-4 text-caption text-mdt-muted">
        <Row gap={3} wrap>
          <Text as="span" size="caption" tone="muted">📄 {item.stats.views.toLocaleString()} views</Text>
          <Text as="span" size="caption" tone="muted">📋 {item.stats.copies.toLocaleString()} copies</Text>
          <Text as="span" size="caption" tone="muted">👍 {item.stats.votes.toLocaleString()} votes</Text>
        </Row>
        <Row gap={2} align="center">
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
