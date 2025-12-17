import { AtlasSearch } from "@/components/atlas/AtlasSearch";
import { LastUpdatedBadge } from "@/components/atlas/LastUpdatedBadge";

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
            <AtlasSearch />
          </div>
        </div>
      </div>
    </header>
  );
}
