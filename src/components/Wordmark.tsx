import Link from "next/link";
import { cn } from "@/lib/cn";

type WordmarkSize = "sm" | "md" | "lg";

export type WordmarkProps = {
  asLink?: boolean;
  href?: string;
  size?: WordmarkSize;
  className?: string;
};

const sizeClasses: Record<WordmarkSize, { root: string; motif: string; block: string; town: string }> = {
  sm: {
    root: "text-body-sm",
    motif: "grid-cols-4 grid-rows-3",
    block: "tracking-[0.01em]",
    town: "tracking-[0.02em]",
  },
  md: {
    root: "text-[1.15rem]",
    motif: "grid-cols-4 grid-rows-3",
    block: "tracking-[0.01em]",
    town: "tracking-[0.02em]",
  },
  lg: {
    root: "text-h3",
    motif: "grid-cols-5 grid-rows-3",
    block: "tracking-[0.005em]",
    town: "tracking-[0.01em]",
  },
};

function BlockMotif({ size }: { size: WordmarkSize }) {
  const base = "inline-grid shrink-0 gap-px";
  const block = "h-1.5 w-1.5 rounded-[2px]";
  const toneOn = "bg-mdt-primary";
  const toneSoft = "bg-mdt-border-strong/70 dark:bg-mdt-border/70";
  const toneOff = "bg-transparent";

  const cells =
    size === "lg"
      ? [
          toneOff,
          toneOff,
          toneOn,
          toneOff,
          toneOff,
          toneOff,
          toneSoft,
          toneOn,
          toneSoft,
          toneOff,
          toneOn,
          toneSoft,
          toneOn,
          toneSoft,
          toneOn,
        ]
      : [toneOff, toneOn, toneOff, toneOff, toneSoft, toneOn, toneSoft, toneOff, toneOn, toneSoft, toneOn, toneOn];

  return (
    <span
      aria-hidden="true"
      data-testid="wordmark-motif"
      className={cn(base, sizeClasses[size].motif)}
    >
      {cells.map((cell, index) => (
        <span key={index} className={cn(block, cell)} />
      ))}
    </span>
  );
}

export function Wordmark({ asLink = true, href = "/", size = "md", className }: WordmarkProps) {
  const classes = cn(
    "inline-flex items-center gap-mdt-2 whitespace-nowrap select-none",
    sizeClasses[size].root,
    className
  );

  const content = (
    <>
      <BlockMotif size={size} />
      <span className="leading-none">
        <span className={cn("font-display font-semibold text-mdt-text", sizeClasses[size].block)}>Block</span>
        <span className={cn("font-mono font-semibold text-mdt-primary", sizeClasses[size].town)}>Town</span>
      </span>
    </>
  );

  if (!asLink) {
    return (
      <span data-testid="wordmark" className={classes} aria-label="BlockTown">
        {content}
      </span>
    );
  }

  return (
    <Link data-testid="wordmark" href={href} className={classes} aria-label="BlockTown">
      {content}
    </Link>
  );
}

