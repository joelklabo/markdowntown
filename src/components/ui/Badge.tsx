import { cn } from "@/lib/cn";
import React from "react";

type BadgeProps = {
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
} & React.HTMLAttributes<HTMLSpanElement>;

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  const toneMap: Record<NonNullable<BadgeProps["tone"]>, string> = {
    neutral: "bg-[color:var(--mdt-color-surface-subtle)] text-mdt-text",
    primary: "bg-[color:var(--mdt-color-primary-soft)] text-[color:var(--mdt-color-primary-strong)]",
    success: "bg-[color:var(--mdt-color-success)]/15 text-[color:var(--mdt-color-success)]",
    warning: "bg-[color:var(--mdt-color-warning)]/18 text-[color:var(--mdt-color-warning)]",
    danger: "bg-[color:var(--mdt-color-danger)]/16 text-[color:var(--mdt-color-danger)]",
    info: "bg-[color:var(--mdt-color-info)]/16 text-[color:var(--mdt-color-info)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-mdt-1 rounded-mdt-pill px-mdt-2 py-[2px] text-caption font-semibold",
        toneMap[tone],
        className
      )}
      {...props}
    />
  );
}
