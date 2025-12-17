import React from "react";
import { cn } from "@/lib/cn";

export const MDX_ALLOWED_COMPONENTS = new Set<string>(["CodeBlock"]);

type CodeBlockProps = React.HTMLAttributes<HTMLPreElement> & {
  children?: React.ReactNode;
};

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  return (
    <pre
      data-mdx-code-block
      className={cn(
        "mdx-code-block overflow-x-auto rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-2 text-[11px] leading-relaxed text-mdt-text",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  );
}

export const MDX_COMPONENTS = {
  pre: CodeBlock,
  CodeBlock,
};
