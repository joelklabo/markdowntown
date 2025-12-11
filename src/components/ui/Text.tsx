import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const textVariants = cva("", {
  variants: {
    size: {
      body: "text-body",
      bodySm: "text-body-sm",
      caption: "text-caption",
    },
    tone: {
      default: "text-mdt-text",
      muted: "text-mdt-muted",
      subtle: "text-mdt-text-subtle",
      onStrong: "text-mdt-text-on-strong",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    leading: {
      tight: "leading-tight",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    size: "body",
    tone: "default",
    weight: "regular",
  },
});

export type TextProps = VariantProps<typeof textVariants> & {
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>;

export function Text({
  as: Comp = "p",
  size,
  tone,
  weight,
  leading,
  align,
  className,
  ...props
}: TextProps) {
  return (
    <Comp
      className={cn(textVariants({ size, tone, weight, leading, align }), className)}
      {...props}
    />
  );
}

export type CodeTextProps = Omit<TextProps, "as"> & {
  as?: React.ElementType;
};

export function CodeText({
  as: Comp = "code",
  size = "bodySm",
  tone,
  weight,
  leading,
  align,
  className,
  ...props
}: CodeTextProps) {
  return (
    <Comp
      className={cn(textVariants({ size, tone, weight, leading, align }), "font-mono", className)}
      {...props}
    />
  );
}
