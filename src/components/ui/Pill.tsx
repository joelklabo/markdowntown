import { cn } from "@/lib/cn";
import React from "react";

type PillProps = {
  tone?: "primary" | "yellow" | "blue" | "red" | "green" | "gray";
} & React.HTMLAttributes<HTMLSpanElement>;

export function Pill({ tone = "primary", className, ...props }: PillProps) {
  const toneMap: Record<NonNullable<PillProps["tone"]>, string> = {
    primary: "pill-primary",
    yellow: "pill-yellow",
    blue: "pill-blue",
    red: "pill-red",
    green: "pill-green",
    gray: "pill-gray",
  };
  const toneClass = toneMap[tone] ?? toneMap.primary;
  return <span className={cn("pill", toneClass, className)} {...props} />;
}
