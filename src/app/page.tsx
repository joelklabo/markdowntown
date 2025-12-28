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

export const metadata: Metadata = {
  title: "mark downtown | Compose, remix, and ship agents.md fast",
  description: "Scan a repo to see which instructions load, then build and export agents.md with confidence.",
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
    title: "Scan + insights",
    desc: "See which instruction files load, what is missing, and why before you build.",
  },
  {
    title: "Guided Workbench",
    desc: "Assemble scopes and blocks, reorder, and preview live before export.",
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
  { title: "Scan a folder", copy: "Preview which instruction files load and in what order." },
  { title: "Review insights", copy: "Confirm missing files and precedence before editing." },
  { title: "Build & export", copy: "Open Workbench to edit and export agents.md." },
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
          <Container size="lg" padding="lg" className="py-mdt-14 md:py-mdt-16">
            <Surface tone="raised" padding="lg" className="mx-auto max-w-3xl space-y-mdt-5 border-mdt-border-strong text-center shadow-mdt-lg">
              <Row justify="center">
                <Pill tone="yellow">Library empty</Pill>
              </Row>
              <Heading level="display" leading="tight" className="mx-auto max-w-[20ch]">
                Scan a folder to start
              </Heading>
              <Text tone="muted" className="mx-auto max-w-2xl">
                The Library is empty right now. Scan a repo to preview instruction files and open Workbench to export agents.md.
              </Text>
              <Row justify="center" gap={3} wrap>
                <Button size="lg" asChild>
                  <Link href="/atlas/simulator">Scan a folder</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/workbench">Open Workbench</Link>
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
            className="flex flex-col gap-mdt-10 pb-mdt-16 pt-mdt-12 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-mdt-12 md:pt-mdt-16"
          >
            <div className="space-y-mdt-6">
              <Row align="center" gap={2}>
                <Pill tone="yellow" className="uppercase tracking-wide">Public-first</Pill>
                <Text size="caption" tone="muted">Copy without login</Text>
              </Row>
              <Stack gap={3}>
                <Heading level="display" leading="tight" className="max-w-[22ch]">
                  Scan your repo. See which instructions load.
                </Heading>
                <Text tone="muted" className="max-w-2xl">
                  Review insights, refine in Workbench, and export agents.md with confidence in minutes.
                </Text>
              </Stack>

              <Card
                padding="lg"
                className="grid gap-mdt-5 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <Stack gap={3}>
                  <Text size="caption" tone="muted">Start here</Text>
                  <Heading level="h3" as="h2">Scan a folder</Heading>
                  <Text size="bodySm" tone="muted">
                    Preview which instruction files load, then open Workbench to export agents.md.
                  </Text>
                </Stack>
                <div className="space-y-mdt-2 sm:text-right">
                  <Row wrap gap={2} justify="end" className="sm:justify-end">
                    <Button size="lg" asChild>
                      <Link href="/atlas/simulator">Scan a folder</Link>
                    </Button>
                    <Button variant="secondary" size="lg" asChild>
                      <Link href="/workbench">Open Workbench</Link>
                    </Button>
                  </Row>
                  <Text size="caption" tone="muted">
                    Prefer inspiration first?{" "}
                    <Link
                      href="/library"
                      className="font-medium text-mdt-text underline decoration-mdt-border-strong underline-offset-4"
                    >
                      Browse the Library.
                    </Link>
                  </Text>
                </div>
              </Card>

              <div className="grid gap-mdt-4 sm:grid-cols-3">
                {proof.map((item) => (
                  <Card key={item.label} tone="subtle" padding="md" className="space-y-mdt-1">
                    <Text size="caption" tone="muted">{item.label}</Text>
                    <Heading level="h2" as="p">{item.value}</Heading>
                    <Text size="caption" tone="muted">{item.hint}</Text>
                  </Card>
                ))}
              </div>
            </div>

            <div className="relative">
              <Surface tone="raised" padding="lg" className="space-y-mdt-6">
                <Row align="center" justify="between" gap={3}>
                  <Stack gap={1}>
                    <Text size="caption" tone="muted">Live Workbench preview</Text>
                    <Heading level="h3" as="h2">Structured agents.md</Heading>
                  </Stack>
                    <Button size="xs" variant="secondary" asChild>
                      <Link href="/workbench">Open Workbench</Link>
                    </Button>
                </Row>
                <Surface tone="subtle" padding="md" className="space-y-mdt-4">
                  <Row align="center" gap={2} className="text-body-sm text-mdt-muted">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--mdt-color-success)]" aria-hidden />
                    Live preview ready - autosaves disabled for anon
                  </Row>
                  <div className="grid gap-mdt-2 md:grid-cols-2">
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
                  <div className="grid gap-mdt-2">
                    <div className="h-2 w-full rounded-md bg-[color:var(--mdt-color-primary-soft)]" />
                    <div className="h-2 w-[82%] rounded-md bg-[color:var(--mdt-color-success-soft)]" />
                    <div className="h-2 w-[64%] rounded-md bg-[color:var(--mdt-color-info-soft)]" />
                  </div>
                </Surface>
              </Surface>
            </div>
          </Container>
        </section>
      </div>

      <Container size="lg" padding="lg" className="pb-mdt-16 pt-mdt-12">
        <Stack gap={12}>
          <Surface as="section" id="build-in-60s" padding="lg" className="grid gap-mdt-6 border-mdt-border-strong md:grid-cols-[1.4fr_1fr]">
            <Stack gap={3}>
              <Text size="caption" tone="muted">Scan to export</Text>
              <Heading level="h2" as="h3">A clear, scan-first path</Heading>
              <Stack gap={4}>
                {buildSteps.map((step, idx) => (
                  <Surface key={step.title} tone="subtle" padding="sm" className="flex items-start gap-mdt-3">
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
                <Button variant="secondary" asChild>
                  <Link href="/workbench">Open Workbench</Link>
                </Button>
              </Row>
            </Stack>

            <Surface tone="subtle" padding="md" className="space-y-mdt-5 border-dashed">
              <Text size="caption" tone="muted">Quality signals</Text>
              <div className="grid gap-mdt-3 sm:grid-cols-2">
                {["Live preview", "Copy without login", "Keyboard shortcuts", "Light & dark"].map((label) => (
                  <Surface key={label} padding="sm" className="text-body-sm">
                    {label}
                  </Surface>
                ))}
              </div>
              <Surface padding="sm" className="text-body-sm text-mdt-muted">
                Use a template to jump to curated rails, and the bottom nav keeps Workbench one tap away on mobile.
              </Surface>
            </Surface>
          </Surface>

          <section className="space-y-mdt-5" id="features">
            <Stack gap={2}>
              <Text size="caption" tone="muted">Why teams ship with markdowntown</Text>
              <Heading level="h2" as="h3">Everything you need to move fast</Heading>
              <Text size="bodySm" tone="muted" className="max-w-2xl">
                From discovery to export, every step stays structured, shareable, and consistent with your agents.md standards.
              </Text>
            </Stack>
            <div className="grid gap-mdt-4 md:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="space-y-mdt-3 bg-[color:var(--mdt-color-surface)] motion-reduce:transition-none">
                  <Heading level="h3" as="h4">{feature.title}</Heading>
                  <Text size="bodySm" tone="muted">{feature.desc}</Text>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-mdt-6 lg:grid-cols-[2fr_1fr]" id="templates">
            <div className="space-y-mdt-4">
              <div className="flex flex-col gap-mdt-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-caption text-mdt-muted">Featured</p>
                  <h3 className="text-h2">Trending snippets & templates</h3>
                </div>
                <Button variant="secondary" asChild>
                  <Link href="/library">Browse all</Link>
                </Button>
              </div>
              <div className="grid gap-mdt-4 sm:grid-cols-2 lg:grid-cols-3">
                {trending.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
                {trending.length === 0 && (
                  <Card className="p-mdt-4 text-sm text-mdt-muted">No public items yet. Check back soon.</Card>
                )}
              </div>
            </div>

            <Card className="space-y-mdt-4">
              <div className="flex flex-col gap-mdt-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-caption text-mdt-muted">Tags</p>
                  <h3 className="text-h3">What people search</h3>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tags">View tags</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-mdt-2">
                {tags.slice(0, 18).map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/library?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-1 text-body-sm text-mdt-text transition duration-mdt-fast ease-mdt-standard hover:-translate-y-[1px] hover:bg-mdt-surface hover:border-mdt-border-strong hover:shadow-mdt-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="font-medium">#{tag}</span>
                    <span className="text-caption text-mdt-muted">{count}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </section>

          <section className="space-y-mdt-8" id="featured">
            <div className="grid gap-mdt-6 lg:grid-cols-[2fr_1fr]">
              <Card className="space-y-mdt-4">
                <div className="flex flex-col gap-mdt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-caption text-mdt-muted">Most copied</p>
                    <h3 className="text-h3">agents.md files people grab</h3>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/library?sort=copied">See list</Link>
                  </Button>
                </div>
                <div className="space-y-mdt-3">
                  {copiedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-mdt-3 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-mdt-1">
                        <div className="flex items-center gap-mdt-2">
                          <Pill tone="blue">agents.md</Pill>
                          {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
                        </div>
                        <p className="font-semibold text-mdt-text">{item.title}</p>
                        <p className="text-xs text-mdt-muted">
                          {item.stats.copies.toLocaleString()} copies - {item.stats.views.toLocaleString()} views
                        </p>
                      </div>
                      <Button size="sm" className="w-full sm:w-auto" asChild>
                        <Link href={`/files/${item.slug ?? item.id}`}>Copy</Link>
                      </Button>
                    </div>
                  ))}
                  {copiedFiles.length === 0 && <p className="text-sm text-mdt-muted">No public files yet.</p>}
                </div>
              </Card>

              <Card className="space-y-mdt-4 border border-dashed border-mdt-border bg-mdt-surface-subtle">
                <div className="flex flex-col gap-mdt-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-h3">Why sign in</h3>
                  <Pill tone="yellow">Optional</Pill>
                </div>
                <ul className="list-disc space-y-mdt-2 pl-mdt-5 text-sm text-mdt-muted">
                  <li>Save agents.md documents and favorites.</li>
                  <li>Resume Workbench with your snippets and templates.</li>
                  <li>Vote, comment, and track copies/downloads.</li>
                </ul>
                <div className="flex flex-wrap gap-mdt-2">
                  <Button asChild>
                    <Link href="/signin?callbackUrl=/">Sign in</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/library">Keep browsing</Link>
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="space-y-mdt-4" id="new">
              <div className="flex flex-col gap-mdt-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-caption text-mdt-muted">New this week</p>
                  <h3 className="text-h3">Fresh snippets, templates, and files</h3>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/library?sort=new">See all new</Link>
                </Button>
              </div>
              <div className="grid gap-mdt-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentItems.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
                {recentItems.length === 0 && <Card className="p-mdt-4 text-sm text-mdt-muted">No new items yet.</Card>}
              </div>
            </Card>

            <Card className="space-y-mdt-4" id="template-spotlight">
              <div className="flex flex-col gap-mdt-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-caption text-mdt-muted">Template spotlight</p>
                  <h3 className="text-h3">Start from a proven template</h3>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/templates">View templates</Link>
                </Button>
              </div>
              <div className="grid gap-mdt-4 sm:grid-cols-2 lg:grid-cols-3">
                {spotlightTemplates.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
                {spotlightTemplates.length === 0 && <Card className="p-mdt-4 text-sm text-mdt-muted">No templates yet.</Card>}
              </div>
            </Card>
          </section>

          <div className="mx-auto max-w-4xl rounded-mdt-lg border border-mdt-border-strong bg-[color:var(--mdt-color-surface-raised)] p-mdt-10 text-center shadow-mdt-lg space-y-mdt-4 sm:p-mdt-12">
            <Heading level="h1" as="h2" align="center">Start with a scan</Heading>
            <Text tone="muted" align="center">
              Scan a repo to see what loads, then open Workbench to refine and export agents.md. Use the Library when you want inspiration.
            </Text>
            <Row justify="center" gap={3} className="mt-mdt-6">
              <Button size="lg" asChild>
                <Link href="/atlas/simulator">Scan a folder</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/workbench">Open Workbench</Link>
              </Button>
            </Row>
          </div>
        </Stack>
      </Container>
    </div>
  );
}
