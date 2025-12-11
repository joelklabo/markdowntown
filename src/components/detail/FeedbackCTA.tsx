import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

type Props = {
  title: string;
  ctaHref?: string;
};

export function FeedbackCTA({ title, ctaHref = "mailto:hello@markdown.town?subject=Feedback" }: Props) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-mdt-3 bg-mdt-surface-subtle p-mdt-3 text-body-sm">
      <div className="space-y-mdt-1">
        <Text as="p" weight="semibold" tone="default">
          Share feedback
        </Text>
        <Text as="p" tone="muted">
          Tell us if this {title.toLowerCase()} needs fixes or improvements.
        </Text>
      </div>
      <Button asChild variant="secondary" size="xs">
        <Link href={ctaHref}>Send feedback</Link>
      </Button>
    </Card>
  );
}
