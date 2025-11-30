import { cn } from "@/lib/cn";
import React from "react";

type PillProps = {
  tone?: "primary" | "yellow";
} & React.HTMLAttributes<HTMLSpanElement>;

export function Pill({ tone = "primary", className, ...props }: PillProps) {
  const toneClass = tone === "primary" ? "pill-primary" : "pill-yellow";
  return <span className={cn("pill", toneClass, className)} {...props} />;
}
