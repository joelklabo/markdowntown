import * as React from "react";
import { cn, focusRing, interactiveBase } from "@/lib/cn";

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
};

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, label, ...props },
  ref
) {
  return (
    <label className={cn("inline-flex items-center gap-2 text-body-sm text-mdt-text", props.disabled && "opacity-60")}>
      <input
        type="radio"
        ref={ref}
        className={cn(
          "h-4 w-4 cursor-pointer appearance-none rounded-full border border-mdt-border bg-mdt-surface",
          interactiveBase,
          focusRing,
          "checked:border-transparent checked:bg-[color:var(--mdt-color-primary)] checked:shadow-mdt-sm",
          className
        )}
        style={{ accentColor: "var(--mdt-color-primary)" }}
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
});
