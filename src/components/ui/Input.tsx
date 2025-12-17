import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRing, interactiveBase } from "@/lib/cn";

const inputVariants = cva(
  cn(
    "w-full rounded-mdt-md border border-mdt-border bg-mdt-surface text-mdt-text placeholder:text-mdt-muted",
    interactiveBase,
    focusRing
  ),
  {
    variants: {
      size: {
        xs: "h-mdt-8 px-mdt-2 py-mdt-1 text-caption",
        sm: "h-mdt-9 px-mdt-3 py-mdt-2 text-body-sm",
        md: "h-mdt-10 px-mdt-3 py-mdt-2 text-body-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputVariants>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", size, ...props },
  ref
) {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        inputVariants({ size }),
        className
      )}
      {...props}
    />
  );
});
