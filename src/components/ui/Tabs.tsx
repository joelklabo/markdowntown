import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn, focusRing, interactiveBase } from "@/lib/cn";

const triggerBase = cn(
  "inline-flex min-h-[var(--mdt-space-11)] items-center justify-center gap-mdt-2 rounded-mdt-pill px-mdt-3 py-mdt-2 text-body-sm font-medium border border-transparent whitespace-nowrap",
  "text-[color:var(--mdt-color-text-muted)] hover:bg-[color:var(--mdt-color-surface-subtle)]",
  "data-[state=active]:bg-[color:var(--mdt-color-surface-strong)] data-[state=active]:border-[color:var(--mdt-color-border)] data-[state=active]:text-[color:var(--mdt-color-text)] data-[state=active]:shadow-mdt-sm",
  interactiveBase,
  focusRing
);

export const TabsRoot = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex max-w-full items-center gap-mdt-1 overflow-x-auto rounded-mdt-pill bg-[color:var(--mdt-color-surface-subtle)] p-mdt-1",
        className
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger className={cn(triggerBase, className)} {...props} />
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
