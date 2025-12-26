import { cn } from "@/lib/cn";
import React from "react";

type PillProps = {
  tone?: "primary" | "yellow" | "blue" | "red" | "green" | "gray";
} & React.HTMLAttributes<HTMLSpanElement>;

export function Pill({ tone = "primary", className, ...props }: PillProps) {
  const toneMap: Record<NonNullable<PillProps["tone"]>, string> = {
    primary: "bg-mdt-primary-soft text-mdt-primary-strong",
    yellow: "bg-mdt-accent-soft text-mdt-accent",
    blue: "bg-[color:var(--mdt-color-info-soft)] text-[color:var(--mdt-color-info)]",
    red: "bg-[color:var(--mdt-color-danger-soft)] text-[color:var(--mdt-color-danger)]",
    green: "bg-[color:var(--mdt-color-success-soft)] text-[color:var(--mdt-color-success)]",
    gray: "bg-mdt-surface-subtle text-mdt-text",
  };
  const toneClass = toneMap[tone] ?? toneMap.primary;
  return (
    <span
      className={cn(
        "inline-flex h-mdt-7 items-center gap-mdt-1 rounded-mdt-pill px-mdt-3 text-caption font-medium leading-none",
        toneClass,
        className
      )}
      {...props}
    />
  );
}
