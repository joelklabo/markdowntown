import { notFound } from "next/navigation";
import { sampleItems } from "@/lib/sampleContent";
import { Pill } from "@/components/ui/Pill";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FileActions } from "@/components/file/FileActions";
import { DetailTabs } from "@/components/detail/DetailTabs";
import { DetailStats } from "@/components/detail/DetailStats";
import { DetailWarning } from "@/components/detail/DetailWarning";
import { FeedbackCTA } from "@/components/detail/FeedbackCTA";
import { Container } from "@/components/ui/Container";
import { Stack, Row } from "@/components/ui/Stack";
import { Surface } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = sampleItems.find((i) => i.id === id && i.type === "file");
  if (!item) return { title: "agents.md not found" };
  return {
    title: `${item.title} | MarkdownTown`,
    description: item.description,
  };
}

export function generateStaticParams() {
  return sampleItems.filter((i) => i.type === "file").map((item) => ({ id: item.id }));
}

export default async function FileDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = sampleItems.find((i) => i.id === id && i.type === "file");
  if (!item) return notFound();

  const renderedContent = [
    `# ${item.title}`,
    "",
    item.description,
    "",
    "## Components",
    "- System prompt",
    "- Style guide",
    "- Tools instructions",
    "- Testing checklist",
  ]
    .filter(Boolean)
    .join("\n");

  const visibility: "PUBLIC" | "PRIVATE" | "UNLISTED" = "PUBLIC";

  return (
    <main id="main-content" className="py-mdt-8">
      <Container size="md" padding="md">
        <Stack gap={6}>
          <Breadcrumb
            segments={[
              { href: "/", label: "Home" },
              { href: "/browse", label: "Browse" },
              { label: item.title },
            ]}
          />

          <Surface tone="raised" padding="lg" className="space-y-mdt-3">
            <DetailWarning visibility={visibility} type="file" />

            <Row wrap gap={4} justify="between" align="start" className="items-start">
              <Stack gap={2} className="min-w-0">
                <Row wrap gap={2} className="items-center">
                  <Pill tone="blue">agents.md</Pill>
                  {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
                </Row>
                <Heading level="display" leading="tight">{item.title}</Heading>
                <Text tone="muted" className="max-w-3xl">{item.description}</Text>
                <Row wrap gap={2}>
                  {item.tags.map((tag) => (
                    <Pill key={tag} tone="gray">#{tag}</Pill>
                  ))}
                </Row>
                <FileActions
                  id={item.id}
                  slug={item.slug ?? item.id}
                  title={item.title}
                  content={renderedContent}
                  builderHref={`/builder?clone=${item.id}`}
                />
              </Stack>
              <Stack gap={2} align="end" className="w-full md:w-auto">
                <DetailStats views={item.stats.views} copies={item.stats.copies} votes={item.stats.votes} />
              </Stack>
            </Row>
          </Surface>

          <DetailTabs title={item.title} rendered={renderedContent} raw={renderedContent} copyLabel="Copy" />

          <Surface padding="md" className="space-y-mdt-3">
            <Heading level="h3" as="h3">Components</Heading>
            <ul className="list-disc pl-5 text-sm text-mdt-muted">
              <li>System prompt</li>
              <li>Style guide</li>
              <li>Tools instructions</li>
              <li>Testing checklist</li>
            </ul>
          </Surface>

          <FeedbackCTA title="agents.md file" />
        </Stack>
      </Container>
    </main>
  );
}
