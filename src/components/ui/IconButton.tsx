import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import React from "react";

const styles = cva(
  "inline-flex items-center justify-center rounded-mdt-md border transition duration-mdt-fast ease-mdt-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]",
  {
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
        sm: "h-9 w-9 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-11 w-11 text-lg",
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
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof styles> {
  asChild?: boolean;
}

export function IconButton({ className, variant, size, shape, asChild, ...props }: IconButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(styles({ variant, size, shape }), className)} {...props} />;
}
