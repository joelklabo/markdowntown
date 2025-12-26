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
              Preview which instruction files a tool would load, then get clear next steps to fix gaps.
            </Text>
          </Stack>
          <ContextSimulator />
        </Stack>
      </Container>
    </main>
  );
}
