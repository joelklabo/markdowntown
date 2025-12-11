import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn, focusRing, interactiveBase } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

const triggerVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 rounded-mdt-pill px-mdt-3 py-mdt-2 text-body-sm font-medium border",
    interactiveBase,
    focusRing
  ),
  {
    variants: {
      active: {
        true: "bg-[color:var(--mdt-color-surface-strong)] border-[color:var(--mdt-color-border)] text-[color:var(--mdt-color-text)] shadow-mdt-sm",
        false:
          "bg-transparent border-transparent text-[color:var(--mdt-color-text-muted)] hover:bg-[color:var(--mdt-color-surface-subtle)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export const TabsRoot = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-mdt-1 rounded-mdt-pill bg-[color:var(--mdt-color-surface-subtle)] p-mdt-1",
        className
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof triggerVariants>;

export function TabsTrigger({ className, active, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger className={cn(triggerVariants({ active }), className)} {...props} />
  );
}

export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-mdt-4 rounded-mdt-lg border border-mdt-border bg-mdt-surface p-mdt-4 shadow-mdt-sm", className)}
      {...props}
    />
  );
}
