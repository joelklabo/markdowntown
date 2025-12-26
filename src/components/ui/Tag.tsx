import { IconButton } from "./IconButton";
import { cn } from "@/lib/cn";
import React from "react";

type TagProps = {
  label: string;
  onRemove?: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function Tag({ label, onRemove, className, ...props }: TagProps) {
  return (
    <div
      className={cn(
        "inline-flex h-mdt-8 items-center gap-mdt-2 rounded-mdt-pill border border-mdt-border bg-mdt-surface-subtle px-mdt-3 text-body-sm text-mdt-text",
        className
      )}
      {...props}
    >
      <span className="font-medium">{label}</span>
      {onRemove ? (
        <IconButton
          variant="ghost"
          size="xs"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="h-mdt-7 w-mdt-7 text-caption"
        >
          ×
        </IconButton>
      ) : null}
    </div>
  );
}
