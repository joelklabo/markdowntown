import Link from "next/link";
import { listPublicItems, type PublicItemType } from "@/lib/publicItems";
import { listTopTags } from "@/lib/publicTags";
import { ArtifactRow, type ArtifactRowItem } from "@/components/library/ArtifactRow";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function asArray(input?: string | string[]): string[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}

function parseType(input?: string): PublicItemType | "all" {
  if (input === "snippet" || input === "template" || input === "file" || input === "agent") return input;
  return "all";
}

function parseHasScopes(input?: string): boolean | undefined {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) return true;
  if (["0", "false", "no", "n"].includes(normalized)) return false;
  return undefined;
}

export default async function LibraryPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const type = parseType(typeof searchParams.type === "string" ? searchParams.type : undefined);

  const tags = [
    ...asArray(searchParams.tag),
    ...(typeof searchParams.tags === "string"
      ? searchParams.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []),
  ]
    .map((t) => t.trim())
    .filter(Boolean);

  const targets = [
    ...asArray(searchParams.target),
    ...(typeof searchParams.targets === "string"
      ? searchParams.targets
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []),
  ]
    .map((t) => t.trim())
    .filter(Boolean);

  const hasScopes = parseHasScopes(typeof searchParams.hasScopes === "string" ? searchParams.hasScopes : undefined);

  const [items, topTags] = await Promise.all([
    listPublicItems({
      limit: 100,
      sort: "recent",
      type,
      tags,
      targets,
      hasScopes,
      search: q.length > 0 ? q : null,
    }),
    listTopTags(24, 30),
  ]);

  const availableTargets = Array.from(new Set(items.flatMap((i) => i.targets))).sort((a, b) => a.localeCompare(b));
  const rowItems: ArtifactRowItem[] = items.map((item) => ({
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    description: item.description,
    tags: item.tags,
    targets: item.targets,
    hasScopes: item.hasScopes,
    stats: item.stats,
    type: item.type,
  }));

  return (
    <Container className="py-8">
      <Stack gap={6}>
        <div>
          <Heading level="h1">Library</Heading>
          <Text tone="muted">Filter public artifacts and open them in Workbench.</Text>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="min-w-0">
            <LibraryFilters
              q={q}
              type={type}
              tags={tags}
              targets={targets}
              hasScopes={hasScopes}
              topTags={topTags}
              availableTargets={availableTargets.length > 0 ? availableTargets : ["agents-md", "github-copilot"]}
            />
          </div>

          <div className="min-w-0 space-y-3">
            {rowItems.map((item) => (
              <ArtifactRow key={item.id} item={item} />
            ))}

            {rowItems.length === 0 && (
              <div className="rounded-mdt-lg border border-mdt-border bg-mdt-surface p-6">
                <Heading level="h3" as="h2">
                  No public items found
                </Heading>
                <Text tone="muted" className="mt-1">
                  Try clearing filters or check back later.
                </Text>
                <div className="mt-4">
                  <Button variant="secondary" asChild>
                    <Link href="/library">Clear filters</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Stack>
    </Container>
  );
}
