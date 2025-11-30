import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-mdt-pill px-4 py-2 text-[0.95rem] font-medium transition duration-150 ease-out border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mdt-blue",
  {
    variants: {
      variant: {
        primary:
          "bg-mdt-blue text-white shadow-mdt-btn hover:bg-[#0047B3] hover:shadow-mdt-btn-hover active:shadow-mdt-sm",
        secondary:
          "bg-white text-mdt-blue border-mdt-blue hover:bg-[#EFF6FF]",
        ghost:
          "bg-transparent text-mdt-blue hover:bg-[rgba(0,87,217,0.06)]",
      },
      size: {
        md: "h-9",
        lg: "h-10 px-5",
        sm: "h-8 px-3 text-[0.85rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
