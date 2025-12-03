import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

const triggerVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-mdt-pill px-3 py-2 text-sm font-medium transition duration-mdt-fast ease-mdt-emphasized border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]",
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
      className={cn("inline-flex items-center gap-2 rounded-mdt-pill bg-[color:var(--mdt-color-surface-subtle)] p-1", className)}
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
      className={cn("mt-4 rounded-mdt-lg border border-mdt-border bg-mdt-surface p-4 shadow-mdt-sm", className)}
      {...props}
    />
  );
}
