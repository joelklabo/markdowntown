import { listPublicItems } from "@/lib/publicItems";
import { LibraryCard } from "@/components/LibraryCard";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Pill } from "@/components/ui/Pill";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function LibraryPage(props: { searchParams: Promise<{ type?: string; tag?: string }> }) {
  const searchParams = await props.searchParams;
  const type = searchParams.type;
  const tag = searchParams.tag;

  // Fetch items
  const items = await listPublicItems({
    type: (type === 'file' || type === 'agent' || type === 'snippet' || type === 'template') ? type : undefined,
    tags: tag ? [tag] : undefined,
    limit: 50,
  });

  return (
    <Container className="py-8">
      <Stack gap={6}>
        <Stack gap={4}>
          <Heading level="h1">Library</Heading>
          <div className="flex gap-2 flex-wrap">
            <FilterLink label="All" active={!type} href="/library" />
            <FilterLink label="Snippets" active={type === 'snippet'} href="/library?type=snippet" />
            <FilterLink label="Templates" active={type === 'template'} href="/library?type=template" />
            <FilterLink label="Agents" active={type === 'agent'} href="/library?type=agent" />
            <FilterLink label="Documents" active={type === 'file'} href="/library?type=file" />
          </div>
        </Stack>

        <Grid columns={1} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <LibraryCard key={item.id} item={item} />
          ))}
        </Grid>
        
        {items.length === 0 && (
          <div className="text-center text-gray-500 py-12">No items found.</div>
        )}
      </Stack>
    </Container>
  );
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link href={href}>
      <Pill tone={active ? 'blue' : 'gray'} className={active ? '' : 'hover:bg-gray-200 cursor-pointer'}>
        {label}
      </Pill>
    </Link>
  );
}
