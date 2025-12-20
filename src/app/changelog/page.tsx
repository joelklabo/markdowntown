import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Stack } from "@/components/ui/Stack";
import { Surface } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Changelog | mark downtown",
  description: "Release notes and history for mark downtown.",
};

async function loadChangelogExcerpt() {
  try {
    const file = await fs.readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
    // Show the top of the changelog so users see the latest release right away.
    return file.split("\n").slice(0, 60).join("\n").trim();
  } catch (err) {
    console.warn("changelog: unable to read file", err);
    return null;
  }
}

export default async function ChangelogPage() {
  const excerpt = await loadChangelogExcerpt();

  return (
    <main id="main-content" className="py-mdt-10 md:py-mdt-12">
      <Container size="md" padding="md">
        <Stack gap={8}>
          <Stack gap={3}>
            <Text size="caption" tone="muted">Changelog</Text>
            <Heading level="display" leading="tight">What\u2019s new in mark downtown</Heading>
            <Text tone="muted">
              Recent releases and fixes. View the complete history on GitHub.
            </Text>
            <Link
              href="https://github.com/joelklabo/markdowntown/blob/main/CHANGELOG.md"
              className="text-mdt-blue hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Open full changelog on GitHub
            </Link>
          </Stack>

          <Surface padding="lg" className="space-y-mdt-4">
            <Heading level="h3" as="h2">Latest entries</Heading>
            {excerpt ? (
              <pre className="whitespace-pre-wrap font-mono text-body-sm text-mdt-text">{excerpt}</pre>
            ) : (
              <Text size="bodySm" tone="muted">
                Couldn\u2019t load the changelog from the repository. Check the GitHub link above for the latest notes.
              </Text>
            )}
          </Surface>
        </Stack>
      </Container>
    </main>
  );
}
