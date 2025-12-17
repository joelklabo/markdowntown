import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

export const dynamic = "force-dynamic";

export default function AtlasChangelogPage() {
  return (
    <main className="py-mdt-2">
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading level="h1">Changelog</Heading>
          <Text tone="muted">Updates to facts, examples, and guides.</Text>
        </Stack>
        <Text tone="muted">No entries yet.</Text>
      </Stack>
    </main>
  );
}
