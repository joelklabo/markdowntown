import { cn } from "@/lib/cn";
import React from "react";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "card transition duration-mdt-base ease-mdt-emphasized hover:-translate-y-[1px] hover:shadow-mdt-md",
        className
      )}
      {...props}
    />
  );
}
