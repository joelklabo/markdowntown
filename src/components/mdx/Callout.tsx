import React from "react";
import { cn } from "@/lib/cn";

type CalloutTone = "info" | "warning" | "danger" | "success";

type CalloutProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: CalloutTone;
  title?: string;
  children?: React.ReactNode;
};

const toneStyles: Record<CalloutTone, string> = {
  info: "border-[color:var(--mdt-color-info)]/20 bg-[color:var(--mdt-color-info)]/10",
  warning: "border-[color:var(--mdt-color-accent)]/20 bg-[color:var(--mdt-color-accent)]/10",
  danger: "border-[color:var(--mdt-color-danger)]/20 bg-[color:var(--mdt-color-danger)]/10",
  success: "border-[color:var(--mdt-color-success)]/20 bg-[color:var(--mdt-color-success)]/10",
};

export function Callout({ tone = "info", title, children, className, ...props }: CalloutProps) {
  return (
    <div
      className={cn("rounded-mdt-lg border px-mdt-4 py-mdt-3 text-body-sm text-mdt-text", toneStyles[tone], className)}
      {...props}
    >
      {title ? <div className="font-semibold">{title}</div> : null}
      {children ? <div className={cn(title ? "mt-mdt-2" : "")}>{children}</div> : null}
    </div>
  );
}
