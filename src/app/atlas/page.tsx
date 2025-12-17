import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

export const dynamic = "force-dynamic";

export default function AtlasPage() {
  return (
    <main id="main-content" className="py-mdt-8">
      <Container size="lg" padding="md">
        <Stack gap={4}>
          <Heading level="h1">Atlas</Heading>
          <Text tone="muted">Coming soon.</Text>
        </Stack>
      </Container>
    </main>
  );
}

