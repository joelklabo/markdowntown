import * as React from "react";
import { cn } from "@/lib/cn";

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
        "w-full rounded-mdt-md border border-mdt-border bg-mdt-surface px-3 py-2 text-mdt-text shadow-mdt-sm transition duration-mdt-fast ease-mdt-emphasized",
        "placeholder:text-mdt-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdt-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});
