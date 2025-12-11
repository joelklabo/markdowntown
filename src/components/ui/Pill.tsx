import { cn } from "@/lib/cn";
import React from "react";

type PillProps = {
  tone?: "primary" | "yellow" | "blue" | "red" | "green" | "gray";
} & React.HTMLAttributes<HTMLSpanElement>;

export function Pill({ tone = "primary", className, ...props }: PillProps) {
  const toneMap: Record<NonNullable<PillProps["tone"]>, string> = {
    primary: "bg-mdt-primary-soft text-mdt-primary-strong",
    yellow: "bg-mdt-accent-soft text-mdt-accent",
    blue: "bg-[color:var(--mdt-color-info)]/15 text-[color:var(--mdt-color-info)]",
    red: "bg-[color:var(--mdt-color-danger)]/16 text-[color:var(--mdt-color-danger)]",
    green: "bg-[color:var(--mdt-color-success)]/15 text-[color:var(--mdt-color-success)]",
    gray: "bg-mdt-surface-strong text-mdt-text",
  };
  const toneClass = toneMap[tone] ?? toneMap.primary;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-mdt-pill px-mdt-2 py-[2px] text-caption font-medium",
        toneClass,
        className
      )}
      {...props}
    />
  );
}
