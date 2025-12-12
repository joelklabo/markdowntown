import * as React from "react";
import { cn, focusRing, interactiveBase } from "@/lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full appearance-none rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2 pr-9 text-body-sm text-mdt-text",
        "bg-[right_0.65rem_center] bg-no-repeat",
        "placeholder:text-mdt-muted",
        interactiveBase,
        focusRing,
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%), linear-gradient(to right, transparent, transparent)",
        backgroundPosition: "calc(100% - 20px) 55%, calc(100% - 14px) 55%, 0 0",
        backgroundSize: "6px 6px, 6px 6px, 2.5em 2.5em",
      }}
      {...props}
    >
      {children}
    </select>
  );
});
