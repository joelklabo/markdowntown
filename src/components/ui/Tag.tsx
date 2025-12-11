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
        "inline-flex items-center gap-mdt-2 rounded-mdt-pill border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-1 text-body-sm text-mdt-text",
        className
      )}
      {...props}
    >
      <span className="font-medium">{label}</span>
      {onRemove ? (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="h-6 w-6 p-0 text-caption"
        >
          ×
        </IconButton>
      ) : null}
    </div>
  );
}
