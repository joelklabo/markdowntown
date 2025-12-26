import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn, focusRing, interactiveBase } from "@/lib/cn";
import React from "react";

const base = cn(
  "inline-flex items-center justify-center gap-mdt-2 rounded-mdt-md border border-transparent font-medium leading-none whitespace-nowrap",
  interactiveBase,
  focusRing
);

const buttonVariants = cva(base, {
  variants: {
    variant: {
      primary:
        "bg-[color:var(--mdt-color-primary)] text-[color:var(--mdt-color-text-on-strong)] shadow-mdt-btn hover:bg-[color:var(--mdt-color-primary-strong)] hover:shadow-mdt-btn-hover active:shadow-mdt-sm",
      secondary:
        "bg-[color:var(--mdt-color-surface)] text-[color:var(--mdt-color-text)] border-[color:var(--mdt-color-border)] hover:bg-[color:var(--mdt-color-surface-subtle)] hover:border-[color:var(--mdt-color-border-strong)] active:bg-[color:var(--mdt-color-surface-strong)]",
      ghost:
        "bg-transparent text-[color:var(--mdt-color-text)] border-transparent hover:bg-[color:var(--mdt-color-surface-subtle)] active:bg-[color:var(--mdt-color-surface-strong)]",
    },
    size: {
      xs: "h-mdt-8 px-mdt-2 text-caption",
      sm: "h-mdt-10 px-mdt-3 text-body-sm",
      md: "h-mdt-11 px-mdt-4 text-body-sm",
      lg: "h-mdt-12 px-mdt-6 text-body",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
