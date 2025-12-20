import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Stack } from "@/components/ui/Stack";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Docs | mark downtown",
  description: "Documentation and guides for mark downtown, agents.md workflows, and agents plugins.",
};

const repoBase = "https://github.com/joelklabo/markdowntown/blob/main";
const docsLinks = [
  { label: "AGENTS.md", href: `${repoBase}/AGENTS.md` },
  { label: "README", href: `${repoBase}/README.md` },
  { label: "Developer onboarding", href: `${repoBase}/docs/DEV_ONBOARDING.md` },
  { label: "Beads CLI", href: `${repoBase}/docs/BEADS.md` },
];

export default function DocsPage() {
  return (
    <main id="main-content" className="py-mdt-10 md:py-mdt-12">
      <Container size="md" padding="md">
        <Stack gap={8}>
          <Stack gap={3}>
            <Text size="caption" tone="muted">Docs</Text>
            <Heading level="display" leading="tight">mark downtown documentation</Heading>
            <Text tone="muted">
              Quick links to the guides already in this repo. More to come as the public library ships.
            </Text>
          </Stack>

          <div className="grid gap-mdt-4 sm:grid-cols-2">
            {docsLinks.map((link) => (
              <Card key={link.href} className="flex items-center justify-between">
                <div>
                  <Heading level="h3" as="h3">{link.label}</Heading>
                  <Text size="bodySm" tone="muted">View {link.label}</Text>
                </div>
                <Link href={link.href} className="text-mdt-blue hover:underline">
                  Open
                </Link>
              </Card>
            ))}
          </div>
        </Stack>
      </Container>
    </main>
  );
}
