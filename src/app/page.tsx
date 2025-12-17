import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LibraryCard } from "@/components/LibraryCard";
import type { SampleItem } from "@/lib/sampleContent";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";
import { listTopTags } from "@/lib/publicTags";
import { hasDatabaseEnv, prisma } from "@/lib/prisma";
import { normalizeTags } from "@/lib/tags";
import { Container } from "@/components/ui/Container";
import { Stack, Row } from "@/components/ui/Stack";
import { Surface } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "MarkdownTown | Compose, remix, and ship agents.md fast",
  description: "Copy battle-tested snippets and templates, preview in the builder, and export agents.md with confidence.",
};

type HomeCounters = {
  artifacts: number;
  copies: number;
  views: number;
};

async function getPublicCounters(): Promise<HomeCounters> {
  if (!hasDatabaseEnv) return { artifacts: 0, copies: 0, views: 0 };

  try {
    const agg = await prisma.artifact.aggregate({
      where: { visibility: "PUBLIC" },
      _count: { _all: true },
      _sum: { copies: true, views: true },
    });

    return {
      artifacts: agg._count._all,
      copies: agg._sum.copies ?? 0,
      views: agg._sum.views ?? 0,
    };
  } catch (err) {
    console.warn("home: failed to compute counters", err);
    return { artifacts: 0, copies: 0, views: 0 };
  }
}

const features = [
  {
    title: "Search + filters",
    desc: "Find the right snippet by tag, type, or quality signals in seconds.",
  },
  {
    title: "Guided builder",
    desc: "Drop in templates and snippets, reorder, and preview live before export.",
  },
  {
    title: "Copy or download",
    desc: "Grab markdown instantly or export agents.md files for your repos and tools.",
  },
  {
    title: "Light/dark parity",
    desc: "Every surface, chip, and card keeps contrast and focus states aligned.",
  },
];

const buildSteps = [
  { title: "Pick a template", copy: "Start from battle-tested scaffolds or go blank." },
  { title: "Add snippets", copy: "Search, tag, and reorder sections with keyboard shortcuts." },
  { title: "Preview & export", copy: "Copy, download, or save to keep history in sync." },
];

export default async function Home() {
  const [tags, publicItems, counters] = await Promise.all([
    listTopTags(8, 30),
    listPublicItems({ limit: 60, sort: "recent", type: "all" }),
    getPublicCounters(),
  ]);

  const toCard = (item: PublicItem): SampleItem => ({
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    description: item.description || "Markdown snippet",
    tags: normalizeTags(item.tags, { strict: false }).tags,
    stats: item.stats,
    type: item.type,
  });

  const items: SampleItem[] = publicItems.map(toCard);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-mdt-bg text-mdt-text">
        <div className="relative overflow-hidden border-b border-mdt-border bg-[color:var(--mdt-color-surface-raised)]">
          <Container size="lg" padding="lg" className="py-mdt-16">
            <Surface tone="raised" padding="lg" className="mx-auto max-w-3xl space-y-4 text-center shadow-mdt-lg">
              <Heading level="display" leading="tight">
                Nothing public yet
              </Heading>
              <Text tone="muted">
                Publish an artifact to seed the Library. Until then, you can still build agents.md locally.
              </Text>
              <Row justify="center" gap={3} wrap>
                <Button asChild>
                  <Link href="/browse">Browse library</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/builder">Open builder</Link>
                </Button>
              </Row>
              <Text size="caption" tone="muted">
                Tip: Make an artifact public to show it on the homepage.
              </Text>
            </Surface>
          </Container>
        </div>
      </div>
    );
  }

  const proof = [
    { label: "Public artifacts", value: counters.artifacts.toLocaleString(), hint: "Live library count" },
    { label: "Total copies", value: counters.copies.toLocaleString(), hint: "Across public artifacts" },
    { label: "Total views", value: counters.views.toLocaleString(), hint: "Across public artifacts" },
  ];

  const trending = items
    .slice()
    .sort((a, b) => b.stats.copies - a.stats.copies || b.stats.views - a.stats.views)
    .slice(0, 6);

  const copiedFiles = items.filter((i) => i.type === "file").slice(0, 3);
  const recentItems = items.slice(0, 6);
  const spotlightTemplates = items.filter((i) => i.type === "template").slice(0, 6);

  return (
    <div className="min-h-screen bg-mdt-bg text-mdt-text">
      <div className="relative overflow-hidden border-b border-mdt-border bg-[color:var(--mdt-color-surface-raised)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(54,214,255,0.08),transparent_55%)]"
          aria-hidden
        />

        <section className="relative">
          <Container
            size="lg"
            padding="lg"
            className="flex flex-col gap-12 pb-mdt-16 pt-mdt-14 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center"
          >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-3 py-1 text-body-sm font-medium text-mdt-muted">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--mdt-color-primary)]">Public-first</span>
              <span>Copy without login</span>
            </div>
            <Stack gap={3}>
              <Heading level="display" leading="tight">Compose, remix, and ship agents.md fast</Heading>
              <Text tone="muted" className="max-w-2xl">
                Copy battle-tested snippets and templates, preview in the builder, and export with confidence. Keyboard-first flows keep you moving; light/dark stay in lockstep.
              </Text>
            </Stack>

            <Surface
              as="form"
              action="/browse"
              padding="md"
              className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <Stack gap={2}>
                <Text as="label" htmlFor="hero-search" size="caption" tone="muted">
                  Search snippets, templates, agents.md
                </Text>
                <Row wrap gap={2} className="items-center">
                  <Input
                    id="hero-search"
                    name="q"
                    className="bg-mdt-surface-subtle py-mdt-3"
                    placeholder='Try "function calling" or "retrieval"'
                    aria-label="Search snippets and templates"
                  />
                  <div className="flex flex-wrap gap-2 text-xs text-mdt-muted sm:ml-2">
                    {tags.slice(0, 4).map(({ tag }) => (
                      <button
                        key={tag}
                        type="submit"
                        name="tag"
                        value={tag}
                        className="rounded-mdt-pill border border-mdt-border bg-[color:var(--mdt-color-surface)] px-3 py-1 shadow-mdt-sm transition hover:-translate-y-[1px] hover:border-mdt-border-strong"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </Row>
              </Stack>
              <Row wrap gap={2} justify="end" className="sm:justify-end">
                <Button type="submit">Browse library</Button>
                <Button variant="secondary" asChild>
                  <Link href="#build-in-60s">Build in 60s</Link>
                </Button>
              </Row>
            </Surface>

            <div className="grid gap-3 sm:grid-cols-3">
              {proof.map((item) => (
                <Surface key={item.label} padding="md" className="space-y-1">
                  <Text size="caption" tone="muted">{item.label}</Text>
                  <Heading level="h2" as="p">{item.value}</Heading>
                  <Text size="bodySm" tone="muted">{item.hint}</Text>
                </Surface>
              ))}
            </div>
          </div>

          <div className="relative">
            <Surface tone="raised" padding="lg" className="space-y-mdt-5 shadow-mdt-lg">
              <Row align="center" justify="between" gap={3}>
                <Stack gap={1}>
                  <Text size="caption" tone="muted">Live builder preview</Text>
                  <Heading level="h3" as="h2">Structured agents.md</Heading>
                </Stack>
                <Button size="xs" variant="secondary" asChild>
                  <Link href="/builder">Open builder</Link>
                </Button>
              </Row>
              <Surface tone="subtle" padding="md" className="space-y-mdt-3">
                <Row align="center" gap={2} className="text-body-sm text-mdt-muted">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--mdt-color-success)]" aria-hidden />
                  Live preview ready - autosaves disabled for anon
                </Row>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { title: "Cache intent", subtitle: "edge / safe" },
                    { title: "Guardrails", subtitle: "sanitized markdown" },
                    { title: "Sections", subtitle: "7 building blocks" },
                    { title: "Status", subtitle: "ready to export" },
                  ].map((item) => (
                    <Surface key={item.title} padding="sm">
                      <Text size="bodySm" weight="semibold">{item.title}</Text>
                      <Text size="caption" tone="muted">{item.subtitle}</Text>
                    </Surface>
                  ))}
                </div>
                <div className="grid gap-2">
                  <div className="h-2 w-full rounded-md bg-[rgba(54,214,255,0.22)]" />
                  <div className="h-2 w-[82%] rounded-md bg-[rgba(124,243,195,0.18)]" />
                  <div className="h-2 w-[64%] rounded-md bg-[rgba(30,168,231,0.16)]" />
                </div>
              </Surface>
            </Surface>
          </div>
          </Container>
        </section>
      </div>

      <Container size="lg" padding="lg" className="pb-mdt-16 pt-mdt-12">
        <Stack gap={12}>
          <Surface as="section" id="build-in-60s" padding="lg" className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <Stack gap={3}>
              <Text size="caption" tone="muted">Build in 60 seconds</Text>
              <Heading level="h2" as="h3">Guided, keyboard-first path</Heading>
              <Stack gap={4}>
                {buildSteps.map((step, idx) => (
                  <Surface key={step.title} tone="subtle" padding="sm" className="flex gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--mdt-color-primary-soft)] text-sm font-semibold text-[color:var(--mdt-color-primary-strong)]">
                      {idx + 1}
                    </span>
                    <div>
                      <Text weight="semibold">{step.title}</Text>
                      <Text size="bodySm" tone="muted">{step.copy}</Text>
                    </div>
                  </Surface>
                ))}
              </Stack>
              <Row wrap gap={3}>
                <Button asChild>
                  <Link href="/builder">Start guided build</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/browse">Browse library</Link>
                </Button>
              </Row>
            </Stack>

            <Surface tone="subtle" padding="md" className="space-y-mdt-4 border-dashed">
              <Text size="caption" tone="muted">Quality signals</Text>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Live preview", "Copy without login", "Keyboard shortcuts", "Light & dark"].map((label) => (
                  <Surface key={label} padding="sm" className="text-body-sm">
                    {label}
                  </Surface>
                ))}
              </div>
              <Surface padding="sm" className="text-body-sm text-mdt-muted">
                Use a template jumps to curated rails, and the bottom nav keeps Builder one tap away on mobile.
              </Surface>
            </Surface>
          </Surface>

          <section className="grid gap-4 md:grid-cols-2" id="features">
            {features.map((feature) => (
              <Card key={feature.title} className="space-y-2 bg-[color:var(--mdt-color-surface)]">
                <Heading level="h3" as="h4">{feature.title}</Heading>
                <Text size="bodySm" tone="muted">{feature.desc}</Text>
              </Card>
            ))}
          </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]" id="templates">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-mdt-muted">Featured</p>
                <h3 className="text-h2">Trending snippets & templates</h3>
              </div>
              <Button variant="secondary" asChild>
                <Link href="/browse">Browse all</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((item) => (
                <LibraryCard key={item.id} item={item} />
              ))}
              {trending.length === 0 && (
                <Card className="p-4 text-sm text-mdt-muted">No public items yet. Check back soon.</Card>
              )}
            </div>
          </div>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-mdt-muted">Tags</p>
                <h3 className="text-h3">What people search</h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tags">View tags</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 18).map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/browse?tag=${encodeURIComponent(tag)}`}
                  className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-3 py-1 text-body-sm text-mdt-text transition duration-mdt-fast ease-mdt-standard hover:bg-mdt-surface hover:border-mdt-border-strong hover:shadow-mdt-sm"
                >
                  #{tag} - {count}
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="space-y-8" id="featured">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-mdt-muted">Most copied</p>
                  <h3 className="text-h3">agents.md files people grab</h3>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/browse?sort=copied">See list</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {copiedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-3 py-3 text-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Pill tone="blue">agents.md</Pill>
                        {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
                      </div>
                      <p className="font-semibold text-mdt-text">{item.title}</p>
                      <p className="text-xs text-mdt-muted">
                        {item.stats.copies.toLocaleString()} copies - {item.stats.views.toLocaleString()} views
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/files/${item.slug ?? item.id}`}>Copy</Link>
                    </Button>
                  </div>
                ))}
                {copiedFiles.length === 0 && <p className="text-sm text-mdt-muted">No public files yet.</p>}
              </div>
            </Card>

            <Card className="space-y-3 border border-dashed border-mdt-border bg-mdt-surface-subtle">
              <div className="flex items-center justify-between">
                <h3 className="text-h3">Why sign in</h3>
                <Pill tone="yellow">Optional</Pill>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-mdt-muted">
                <li>Save agents.md documents and favorites.</li>
                <li>Resume builder with your snippets and templates.</li>
                <li>Vote, comment, and track copies/downloads.</li>
              </ul>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/signin?callbackUrl=/">Sign in</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/browse">Keep browsing</Link>
                </Button>
              </div>
            </Card>
          </div>

          <Card className="space-y-4" id="new">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-mdt-muted">New this week</p>
                <h3 className="text-h3">Fresh snippets, templates, and files</h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/browse?sort=new">See all new</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentItems.map((item) => (
                <LibraryCard key={item.id} item={item} />
              ))}
              {recentItems.length === 0 && <Card className="p-4 text-sm text-mdt-muted">No new items yet.</Card>}
            </div>
          </Card>

          <Card className="space-y-4" id="template-spotlight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-mdt-muted">Template spotlight</p>
                <h3 className="text-h3">Start from a proven template</h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/templates">View templates</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spotlightTemplates.map((item) => (
                <LibraryCard key={item.id} item={item} />
              ))}
              {spotlightTemplates.length === 0 && <Card className="p-4 text-sm text-mdt-muted">No templates yet.</Card>}
            </div>
          </Card>
        </section>

          <div className="mx-auto max-w-4xl rounded-mdt-lg border border-mdt-border bg-[color:var(--mdt-color-surface)] p-10 text-center shadow-mdt-md space-y-4">
          <Heading level="h1" as="h2" align="center">Start building now</Heading>
          <Text tone="muted" align="center">
            Assemble an agents.md with public snippets and templates, then copy or download. Sign in later to save and keep favorites in sync across projects.
          </Text>
          <Row justify="center" gap={3} className="mt-6">
              <Button asChild>
                <Link href="/builder">Open builder</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/browse">Browse library</Link>
              </Button>
            </Row>
          </div>
        </Stack>
      </Container>
    </div>
  );
}
