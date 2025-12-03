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
        "inline-flex items-center gap-2 rounded-mdt-pill border border-mdt-border bg-mdt-surface-subtle px-3 py-1 text-sm text-mdt-text",
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
          className="h-6 w-6 p-0 text-xs"
        >
          ×
        </IconButton>
      ) : null}
    </div>
  );
}
