import { ContextSimulator } from "@/components/atlas/ContextSimulator";
import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

export default function AtlasSimulatorPage() {
  return (
    <main className="py-mdt-4">
      <Stack gap={5}>
        <Stack gap={2} className="max-w-2xl">
          <Heading level="h1">Scan a folder</Heading>
          <Text tone="muted">Preview which instruction files a tool would load and what to fix next.</Text>
        </Stack>
        <ContextSimulator />
      </Stack>
    </main>
  );
}
