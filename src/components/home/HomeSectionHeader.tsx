import React from "react";
import { cn } from "@/lib/cn";
import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

export type HomeSectionHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  ...props
}: HomeSectionHeaderProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <Stack gap={2} className={cn(alignClass, className)} {...props}>
      {eyebrow ? (
        <Text size="caption" tone="muted" className="uppercase tracking-wide">
          {eyebrow}
        </Text>
      ) : null}
      <Heading level="h2" as="h3">
        {title}
      </Heading>
      {description ? (
        <Text size="bodySm" tone="muted" className="max-w-2xl">
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
