import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;

export function DrawerOverlay(props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      {...props}
      className={cn(
        "fixed inset-0 z-40 bg-black/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out",
        props.className
      )}
    />
  );
}

export function DrawerContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        {...props}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-mdt-border bg-mdt-surface shadow-[var(--mdt-shadow-md)]",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
          className
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DrawerHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border-b border-mdt-border px-5 py-4", className)}>
      {children}
    </div>
  );
}

export const DrawerTitle = DialogPrimitive.Title;
export const DrawerDescription = DialogPrimitive.Description;
export const DrawerClose = DialogPrimitive.Close;

export function DrawerCloseButton() {
  return (
    <DrawerClose className="rounded-mdt-md p-2 text-mdt-muted transition hover:bg-[color:var(--mdt-color-surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdt-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]">
      <span aria-hidden className="text-sm font-semibold leading-none">
        ×
      </span>
      <span className="sr-only">Close drawer</span>
    </DrawerClose>
  );
}
