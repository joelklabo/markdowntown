import { ArtifactTable } from "@/components/atlas/ArtifactTable";
import { ClaimList } from "@/components/atlas/ClaimList";
import { ExamplesPanel } from "@/components/atlas/ExamplesPanel";
import { PlatformHeader } from "@/components/atlas/PlatformHeader";
import { SpecCards } from "@/components/atlas/SpecCards";
import { Stack } from "@/components/ui/Stack";
import { listAtlasExamples, loadAtlasFacts } from "@/lib/atlas/load";
import { AtlasPlatformIdSchema } from "@/lib/atlas/schema";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PlatformParams = { platformId: string };

export default async function AtlasPlatformPage({ params }: { params: Promise<PlatformParams> }) {
  const { platformId: platformIdParam } = await params;
  const parsed = AtlasPlatformIdSchema.safeParse(platformIdParam);
  if (!parsed.success) return notFound();

  const platformId = parsed.data;

  const facts = (() => {
    try {
      return loadAtlasFacts(platformId);
    } catch {
      return null;
    }
  })();

  if (!facts) return notFound();

  const examples = listAtlasExamples(platformId);

  return (
    <main className="py-mdt-2">
      <Stack gap={4}>
        <PlatformHeader facts={facts} />
        <SpecCards featureSupport={facts.featureSupport} />
        <ArtifactTable artifacts={facts.artifacts} />
        <ClaimList claims={facts.claims} />
        <ExamplesPanel examples={examples} />
      </Stack>
    </main>
  );
}
