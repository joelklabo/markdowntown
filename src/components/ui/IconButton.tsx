import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn, focusRing, interactiveBase } from "@/lib/cn";
import React from "react";

const base = cn(
  "inline-flex items-center justify-center rounded-mdt-md border",
  interactiveBase,
  focusRing
);

const styles = cva(base, {
  variants: {
    variant: {
      primary:
        "bg-[color:var(--mdt-color-primary)] text-[color:var(--mdt-color-text-on-strong)] border-transparent shadow-mdt-glow hover:bg-[color:var(--mdt-color-primary-strong)] active:shadow-mdt-sm",
      secondary:
        "bg-[color:var(--mdt-color-surface)] text-[color:var(--mdt-color-text)] border-[color:var(--mdt-color-border)] hover:bg-[color:var(--mdt-color-surface-subtle)]",
      ghost:
        "bg-transparent text-[color:var(--mdt-color-text)] border-transparent hover:bg-[color:var(--mdt-color-surface-subtle)]",
    },
    size: {
      xs: "h-mdt-8 w-mdt-8 text-xs",
      sm: "h-mdt-10 w-mdt-10 text-sm",
      md: "h-mdt-11 w-mdt-11 text-base",
      lg: "h-mdt-12 w-mdt-12 text-lg",
    },
    shape: {
      rounded: "rounded-mdt-md",
      pill: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "md",
    shape: "rounded",
  },
});

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof styles> {
  asChild?: boolean;
}

export function IconButton({ className, variant, size, shape, asChild, ...props }: IconButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(styles({ variant, size, shape }), className)} {...props} />;
}
