import { LastUpdatedBadge } from "@/components/atlas/LastUpdatedBadge";
import { cn, focusRing } from "@/lib/cn";

export function AtlasHeader() {
  return (
    <header className="border-b border-mdt-border pb-mdt-4">
      <div className="flex flex-col gap-mdt-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-mdt-3">
          <div className="text-body-sm font-semibold text-mdt-text">Atlas</div>
          <LastUpdatedBadge />
        </div>

        <div className="flex items-center gap-mdt-2">
          <div className="relative w-full md:w-[360px]">
            <input
              type="search"
              aria-label="Search Atlas"
              placeholder="Search Atlas (coming soon)"
              disabled
              className={cn(
                "h-10 w-full rounded-mdt-lg border border-mdt-border bg-mdt-surface px-mdt-3 text-body-sm text-mdt-muted shadow-mdt-sm",
                focusRing
              )}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
