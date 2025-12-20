import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Stack } from "@/components/ui/Stack";
import { Surface } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Terms | mark downtown",
  description: "Terms of use for the mark downtown demo environment.",
};

export default function TermsPage() {
  return (
    <main id="main-content" className="py-mdt-10 md:py-mdt-12">
      <Container size="md" padding="md">
        <Stack gap={8}>
          <Stack gap={3}>
            <Text size="caption" tone="muted">Terms</Text>
            <Heading level="display" leading="tight">mark downtown terms of use</Heading>
            <Text tone="muted">
              These lightweight terms cover using the local/demo version of mark downtown.
            </Text>
          </Stack>

          <Surface padding="lg" className="space-y-mdt-3">
            <Heading level="h3" as="h2">Acceptable use</Heading>
            <ul className="list-disc space-y-mdt-1 pl-mdt-5 text-body-sm text-mdt-muted">
              <li>Use the app for composing, copying, or testing markdown content.</li>
              <li>Avoid uploading sensitive or production data in this demo environment.</li>
              <li>Respect third-party licenses when importing or sharing content.</li>
            </ul>
          </Surface>

          <Surface padding="lg" className="space-y-mdt-3">
            <Heading level="h3" as="h2">Liability & availability</Heading>
            <Text size="bodySm" tone="muted">
              This preview is provided &quot;as is&quot; with no uptime guarantees. Content may be cleared during development cycles.
            </Text>
            <Text size="bodySm" tone="muted">
              Report issues or questions on GitHub{" "}
              <Link href="https://github.com/joelklabo/markdowntown/issues" className="text-mdt-blue hover:underline" target="_blank" rel="noreferrer">
                github.com/joelklabo/markdowntown
              </Link>
              .
            </Text>
          </Surface>
        </Stack>
      </Container>
    </main>
  );
}
