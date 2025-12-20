import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Stack } from "@/components/ui/Stack";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Docs | mark downtown",
  description: "Documentation and guides for mark downtown, agents.md workflows, and agents plugins.",
};

const repoBase = "https://github.com/joelklabo/markdowntown/blob/main";
const docsLinks = [
  {
    label: "AGENTS.md",
    description: "Project-specific agent instructions and workflow defaults.",
    href: `${repoBase}/AGENTS.md`,
  },
  {
    label: "README",
    description: "Product overview, setup notes, and local development hints.",
    href: `${repoBase}/README.md`,
  },
  {
    label: "Atlas Simulator guide",
    description: "Simulate folder context and preview the insights pipeline.",
    href: `${repoBase}/docs/atlas/simulator.md`,
  },
  {
    label: "Developer onboarding",
    description: "Start here for environment, scripts, and architecture notes.",
    href: `${repoBase}/docs/DEV_ONBOARDING.md`,
  },
  {
    label: "Beads CLI",
    description: "Issue workflow conventions and task structure.",
    href: `${repoBase}/docs/BEADS.md`,
  },
];

export default function DocsPage() {
  return (
    <main id="main-content" className="py-mdt-10 md:py-mdt-12">
      <Container size="md" padding="md">
        <Stack gap={10}>
          <Stack gap={4} className="max-w-2xl">
            <Text size="caption" tone="muted">Docs</Text>
            <Heading level="display" leading="tight">mark downtown documentation</Heading>
            <Text tone="muted">
              Quick links to the guides already in this repo. More to come as the public library ships.
            </Text>
          </Stack>

          <div className="grid gap-mdt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
            <Stack gap={4}>
              <div className="flex flex-col gap-mdt-2 sm:flex-row sm:items-center sm:justify-between">
                <Heading level="h3" as="h2">Quick links</Heading>
                <Text size="caption" tone="muted">{docsLinks.length} resources</Text>
              </div>
              <div className="grid gap-mdt-4">
                {docsLinks.map((link) => (
                  <Card
                    key={link.href}
                    padding="lg"
                    className="flex flex-col gap-mdt-4 md:flex-row md:items-center md:justify-between focus-within:border-mdt-border-strong focus-within:shadow-mdt-md motion-reduce:transition-none"
                  >
                    <div className="space-y-mdt-1">
                      <Heading level="h3" as="h3">{link.label}</Heading>
                      <Text size="bodySm" tone="muted">{link.description}</Text>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="group self-start md:self-auto motion-reduce:transition-none"
                    >
                      <Link href={link.href}>
                        <span>Open</span>
                        <span
                          aria-hidden="true"
                          className="transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus:translate-x-0.5 motion-reduce:transform-none"
                        >
                          →
                        </span>
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </Stack>

            <Card tone="subtle" padding="lg" className="space-y-mdt-4">
              <Text size="caption" tone="muted">How to use</Text>
              <Heading level="h3" as="h3">Make the docs work for you</Heading>
              <Text tone="muted">
                Start with the repo-specific guidance, then drill into Atlas when you want to understand agent context and scoring.
              </Text>
              <ul className="space-y-mdt-3 list-disc pl-mdt-5">
                <Text as="li" size="bodySm" tone="muted">
                  Read AGENTS.md before running tasks or pushing changes.
                </Text>
                <Text as="li" size="bodySm" tone="muted">
                  Use the Atlas Simulator guide to preview how folder context is interpreted.
                </Text>
                <Text as="li" size="bodySm" tone="muted">
                  Keep the Beads CLI doc open when sequencing work across issues.
                </Text>
              </ul>
            </Card>
          </div>
        </Stack>
      </Container>
    </main>
  );
}
