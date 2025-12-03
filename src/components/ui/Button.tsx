import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import React from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-mdt-pill px-4 py-2 text-[0.95rem] font-medium transition duration-mdt-fast ease-mdt-emphasized border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)] disabled:opacity-60 disabled:cursor-not-allowed";

const buttonVariants = cva(base, {
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
      md: "h-10",
      lg: "h-11 px-5 text-[1rem]",
      sm: "h-9 px-3 text-[0.88rem]",
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
