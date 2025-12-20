import { cn } from "@/lib/cn";
import React from "react";
import type { SurfaceProps } from "./Surface";
import { Surface } from "./Surface";

export function Card({
  className,
  ...props
}: SurfaceProps<"div">) {
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
