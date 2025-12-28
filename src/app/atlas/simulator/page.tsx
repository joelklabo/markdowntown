import { ContextSimulator } from "@/components/atlas/ContextSimulator";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

export default function AtlasSimulatorPage() {
  return (
    <main className="py-mdt-6 md:py-mdt-8">
      <Container>
        <Stack gap={5}>
          <Stack gap={2} className="max-w-2xl">
            <Heading level="h1">Scan a folder</Heading>
            <Text tone="muted">
              Preview which instruction files load for your tool, then open Workbench to export. Scans stay local in your
              browser—nothing is uploaded.
            </Text>
          </Stack>
          <ContextSimulator />
        </Stack>
      </Container>
    </main>
  );
}
