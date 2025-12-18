import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { featureFlags } from "@/lib/flags";
import { LivingCityWordmarkSvg } from "./wordmark/LivingCityWordmarkSvg";

type WordmarkSize = "sm" | "md" | "lg";

export type WordmarkProps = {
  asLink?: boolean;
  href?: string;
  size?: WordmarkSize;
  className?: string;
};

const sizeClasses: Record<WordmarkSize, { root: string; svg: string }> = {
  sm: { root: "text-body-sm", svg: "h-5" },
  md: { root: "text-[1.15rem]", svg: "h-7" },
  lg: { root: "text-h3", svg: "h-10" },
};

export function Wordmark({ asLink = true, href = "/", size = "md", className }: WordmarkProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  const classes = cn(
    "inline-flex items-center whitespace-nowrap select-none",
    sizeClasses[size].root,
    className
  );

  const content = (
    <LivingCityWordmarkSvg
      titleId={titleId}
      descId={descId}
      className={cn(
        "mdt-wordmark w-auto shrink-0",
        featureFlags.wordmarkAnimV1 && "mdt-wordmark--animated",
        sizeClasses[size].svg
      )}
    />
  );

  if (!asLink) {
    return (
      <span data-testid="wordmark" className={classes} aria-label="mark downtown">
        {content}
      </span>
    );
  }

  return (
    <Link data-testid="wordmark" href={href} className={classes} aria-label="mark downtown">
      {content}
    </Link>
  );
}
