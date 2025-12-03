import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  ctaHref?: string;
};

export function FeedbackCTA({ title, ctaHref = "mailto:hello@markdown.town?subject=Feedback" }: Props) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 border border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] px-4 py-3 text-sm">
      <div className="space-y-1">
        <p className="text-mdt-text font-semibold">Share feedback</p>
        <p className="text-mdt-muted">Tell us if this {title.toLowerCase()} needs fixes or improvements.</p>
      </div>
      <Button asChild variant="secondary" size="sm">
        <Link href={ctaHref}>Send feedback</Link>
      </Button>
    </Card>
  );
}
