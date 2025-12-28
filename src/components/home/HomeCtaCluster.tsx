import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Row } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

type CtaLink = {
  label: string;
  href: string;
};

export type HomeCtaClusterProps = React.HTMLAttributes<HTMLDivElement> & {
  primary: CtaLink;
  secondary?: CtaLink;
  tertiary?: CtaLink;
  align?: "left" | "center" | "right";
};

export function HomeCtaCluster({
  primary,
  secondary,
  tertiary,
  align = "left",
  className,
  ...props
}: HomeCtaClusterProps) {
  const rowAlign =
    align === "center"
      ? "justify-center"
      : align === "right"
        ? "justify-end"
        : "justify-start";

  return (
    <div className={cn("space-y-mdt-2", className)} {...props}>
      <Row wrap gap={2} className={rowAlign}>
        <Button size="lg" asChild>
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        {secondary ? (
          <Button variant="secondary" size="lg" asChild>
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        ) : null}
      </Row>
      {tertiary ? (
        <Text
          size="caption"
          tone="muted"
          className={align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}
        >
          <Link
            href={tertiary.href}
            className="font-medium text-mdt-text underline decoration-mdt-border-strong underline-offset-4"
          >
            {tertiary.label}
          </Link>
        </Text>
      ) : null}
    </div>
  );
}
