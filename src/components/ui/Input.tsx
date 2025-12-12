import * as React from "react";
import { cn, focusRing, interactiveBase } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref
) {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "w-full rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2 text-body-sm text-mdt-text placeholder:text-mdt-muted",
        interactiveBase,
        focusRing,
        className
      )}
      {...props}
    />
  );
});
