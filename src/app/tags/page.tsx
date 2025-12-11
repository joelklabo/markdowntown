import { listTopTags } from "@/lib/publicTags";
import { Pill } from "@/components/ui/Pill";
import { Container } from "@/components/ui/Container";
import { Stack } from "@/components/ui/Stack";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags | MarkdownTown",
  description: "Explore tags to find snippets, templates, and agents.md files by topic.",
};

export const revalidate = 300;

export default async function TagsPage() {
  const tags = await listTopTags(100, 30);
  return (
    <main id="main-content" className="py-mdt-8">
      <Container size="lg" padding="md">
        <Stack gap={6}>
          <Stack gap={1}>
            <Text size="caption" tone="muted">Tags</Text>
            <Heading level="display" leading="tight">Topics people are using right now</Heading>
            <Text tone="muted" className="max-w-2xl">
              Choose a tag to jump into related snippets, templates, and agents.md files.
            </Text>
          </Stack>

          <Surface tone="subtle" padding="md" className="flex flex-wrap gap-mdt-2">
            {tags.length === 0 && <Text tone="muted">No tags yet. Check back soon.</Text>}
            {tags.map(({ tag, count }) => (
              <Pill key={tag} tone="gray" className="flex items-center gap-1">
                <Link href={`/browse?tag=${encodeURIComponent(tag)}`} className="flex items-center gap-1">
                  <Text as="span" size="bodySm" weight="semibold">#{tag}</Text>
                  <Text as="span" size="caption" tone="muted">
                    {count}
                  </Text>
                </Link>
              </Pill>
            ))}
          </Surface>
        </Stack>
      </Container>
    </main>
  );
}
