import { AtlasHeader } from "@/components/atlas/AtlasHeader";
import { AtlasSidebar } from "@/components/atlas/AtlasSidebar";
import { Container } from "@/components/ui/Container";

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-mdt-6">
      <Container size="xl" padding="md">
        <div className="grid gap-mdt-6 lg:grid-cols-[280px,1fr]">
          <aside className="lg:sticky lg:top-16 h-fit">
            <AtlasSidebar />
          </aside>
          <div className="min-w-0">
            <AtlasHeader />
            <div className="pt-mdt-6">{children}</div>
          </div>
        </div>
      </Container>
    </div>
  );
}
