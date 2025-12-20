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
    gray: "bg-mdt-surface-strong text-mdt-text",
  };
  const toneClass = toneMap[tone] ?? toneMap.primary;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-mdt-pill px-mdt-2 py-[calc(var(--mdt-space-1)/4)] text-caption font-medium",
        toneClass,
        className
      )}
      {...props}
    />
  );
}
