import { LibraryCard } from "@/components/LibraryCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Stack, Row } from "@/components/ui/Stack";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Surface } from "@/components/ui/Surface";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { normalizeTags } from "@/lib/tags";
import type { SampleItem } from "@/lib/sampleContent";

export const metadata: Metadata = {
  title: "Templates | MarkdownTown",
  description: "Templates with placeholders you can fill and export to agents.md.",
};

function toCard(item: PublicItem): SampleItem {
  return {
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    description: item.description || "Markdown template",
    tags: normalizeTags(item.tags, { strict: false }).tags,
    stats: item.stats,
    type: item.type,
  };
}

export default async function TemplatesPage() {
  const templates = (await listPublicItems({ limit: 60, type: "template", sort: "recent" })).map(toCard);
  return (
    <main id="main-content" className="py-mdt-8">
      <Container size="lg" padding="md">
        <Stack gap={6}>
          <Row wrap gap={3} justify="between" align="center">
            <Stack gap={1} className="min-w-0">
              <Text size="caption" tone="muted">Templates</Text>
              <Heading level="display" leading="tight">Fill-in-the-blank agents.md templates</Heading>
              <Text tone="muted" className="max-w-2xl">
                Start faster with structured templates. Fill placeholders, preview, then export or add to your builder stack.
              </Text>
            </Stack>
            <Button asChild>
              <Link href="/builder">Open builder</Link>
            </Button>
          </Row>

          {templates.length > 0 ? (
            <div className="grid gap-mdt-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((item) => (
                <LibraryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Surface padding="lg" className="text-center">
              <Text tone="muted">No templates yet.</Text>
            </Surface>
          )}
        </Stack>
      </Container>
    </main>
  );
}
