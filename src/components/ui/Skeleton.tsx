import { cn } from "@/lib/cn";
import React from "react";

type SkeletonProps = {
  className?: string;
};

/**
 * Accessible loading placeholder that respects reduced-motion preferences.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("motion-skeleton rounded-mdt-md bg-mdt-surface-subtle", className)}
    />
  );
}
