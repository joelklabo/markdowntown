import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Stack } from "@/components/ui/Stack";
import { Surface } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Privacy | mark downtown",
  description: "Learn how mark downtown handles data in this preview environment.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="py-mdt-8">
      <Container size="md" padding="md">
        <Stack gap={6}>
          <Stack gap={2}>
            <Text size="caption" tone="muted">Privacy</Text>
            <Heading level="display" leading="tight">How we handle your data</Heading>
            <Text tone="muted">
              mark downtown is running in a local/demo environment. We store minimal data and you can remove it anytime.
            </Text>
          </Stack>

          <Surface padding="lg" className="space-y-mdt-2">
            <Heading level="h3" as="h2">What we collect</Heading>
            <ul className="list-disc space-y-1 pl-5 text-sm text-mdt-muted">
              <li>Authentication data only when you sign in via GitHub.</li>
              <li>Content you choose to save (snippets, templates, or documents).</li>
              <li>Basic usage telemetry when enabled (anonymized for local dev).</li>
            </ul>
          </Surface>

          <Surface padding="lg" className="space-y-mdt-2">
            <Heading level="h3" as="h2">Your choices</Heading>
            <ul className="list-disc space-y-1 pl-5 text-sm text-mdt-muted">
              <li>Use the app without signing in to browse and copy content.</li>
              <li>Delete saved documents from the Documents area when signed in.</li>
              <li>Opt out of telemetry by leaving analytics env vars unset.</li>
            </ul>
            <Text size="bodySm" tone="muted">
              Questions? Reach out via the project GitHub issues{" "}
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
