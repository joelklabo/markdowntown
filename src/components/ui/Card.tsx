import { cn } from "@/lib/cn";
import React from "react";
import { Surface } from "./Surface";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Surface
      className={cn(
        "card",
        className
      )}
      {...props}
    />
  );
}
