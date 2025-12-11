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
        "transition duration-mdt-base ease-mdt-emphasized hover:-translate-y-[1px] hover:shadow-mdt-md",
        className
      )}
      {...props}
    />
  );
}
