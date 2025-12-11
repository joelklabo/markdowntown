import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const surfaceVariants = cva("rounded-mdt-md border border-mdt-border shadow-mdt-sm", {
  variants: {
    tone: {
      default: "bg-mdt-surface",
      subtle: "bg-mdt-surface-subtle",
      strong: "bg-mdt-surface-strong",
      raised: "bg-mdt-surface-raised shadow-mdt-md",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    tone: "default",
    padding: "md",
  },
});

export type SurfaceProps = VariantProps<typeof surfaceVariants> & {
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>;

export function Surface({ as: Comp = "div", tone, padding, className, ...props }: SurfaceProps) {
  return (
    <Comp
      className={cn(surfaceVariants({ tone, padding }), className)}
      {...props}
    />
  );
}

