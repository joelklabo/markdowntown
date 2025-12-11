import React from "react";
import { cn } from "@/lib/cn";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  padded?: boolean;
};

export function Section({ as: Comp = "section", padded = false, className, ...props }: SectionProps) {
  return (
    <Comp
      className={cn(padded ? "py-mdt-8" : undefined, className)}
      {...props}
    />
  );
}

