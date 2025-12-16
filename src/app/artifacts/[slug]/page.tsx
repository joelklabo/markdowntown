import { getPublicItem } from "@/lib/publicItems";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Stack, Row } from "@/components/ui/Stack";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ArtifactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublicItem(slug);

  if (!item) {
    notFound();
  }

  let contentString = "";
  if (typeof item.content === 'string') {
    contentString = item.content;
  } else {
    contentString = JSON.stringify(item.content, null, 2);
  }

  return (
    <Container className="py-8">
      <Stack gap={6}>
        <div className="flex items-start justify-between">
          <Stack gap={2}>
            <Row gap={2} align="center">
              <Pill tone="blue">{item.type}</Pill>
              <Text size="caption" tone="muted">v{item.version}</Text>
            </Row>
            <Heading level="h1">{item.title}</Heading>
            <Text tone="muted">{item.description}</Text>
            <Row gap={1}>
              {item.tags.map(t => <Pill key={t} tone="gray">#{t}</Pill>)}
            </Row>
          </Stack>
          <Row gap={2}>
             <Button variant="secondary" asChild>
               <Link href={`/workbench?fork=${item.slug || item.id}`}>Fork / Edit</Link>
             </Button>
             <Button>Copy</Button>
          </Row>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:bg-gray-900 dark:border-gray-800">
           <pre className="text-sm font-mono overflow-auto whitespace-pre-wrap dark:text-gray-300">
             {contentString}
           </pre>
        </div>
      </Stack>
    </Container>
  );
}
