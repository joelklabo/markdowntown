import * as React from "react";
import { cn, focusRing, interactiveBase } from "@/lib/cn";

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2 text-body-sm text-mdt-text shadow-mdt-sm placeholder:text-mdt-muted",
        interactiveBase,
        focusRing,
        className
      )}
      {...props}
    />
  );
});
