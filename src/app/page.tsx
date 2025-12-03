import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LibraryCard } from "@/components/LibraryCard";
import { sampleItems, sampleTags, type SampleItem } from "@/lib/sampleContent";

export const metadata: Metadata = {
  title: "MarkdownTown | Compose, remix, and ship agents.md fast",
  description: "Copy battle-tested snippets and templates, preview in the builder, and export agents.md with confidence.",
};

const proof = [
  { label: "Snippets & templates", value: "1,200+", hint: "Curated library" },
  { label: "Copies this month", value: "42k", hint: "No login required" },
  { label: "Avg. copy time", value: "12s", hint: "Keyboard-first" },
];

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

const socialProof = [
  {
    quote: "We replaced a folder of gists with MarkdownTown and ship prompts twice as fast.",
    name: "Priya N.",
    role: "LLM platform lead",
  },
  {
    quote: "The builder's live preview keeps our AI docs tidy and reviewable.",
    name: "Diego R.",
    role: "Staff engineer",
  },
];

const buildSteps = [
  { title: "Pick a template", copy: "Start from battle-tested scaffolds or go blank." },
  { title: "Add snippets", copy: "Search, tag, and reorder sections with keyboard shortcuts." },
  { title: "Preview & export", copy: "Copy, download, or save to keep history in sync." },
];

export default async function Home() {
  const tags = sampleTags;
  const items: SampleItem[] = sampleItems;

  const trending = items
    .slice()
    .sort((a, b) => b.stats.copies - a.stats.copies || b.stats.views - a.stats.views)
    .slice(0, 6);

  const copiedFiles: SampleItem[] = sampleItems.filter((i) => i.type === "file").slice(0, 3);
  const recentItems: SampleItem[] = sampleItems.slice(0, 6);
  const spotlightTemplates: SampleItem[] = sampleItems.filter((i) => i.type === "template").slice(0, 6);

  return (
    <div className="min-h-screen bg-mdt-bg text-mdt-text">
      <div className="relative overflow-hidden border-b border-mdt-border bg-[color:var(--mdt-color-surface-raised)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(54,214,255,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(124,243,195,0.14),transparent_26%),radial-gradient(circle_at_60%_70%,rgba(30,168,231,0.10),transparent_32%)]" aria-hidden />

        <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-14 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-mdt-pill bg-[color:var(--mdt-color-surface-subtle)] px-3 py-1 text-sm font-medium text-mdt-muted shadow-mdt-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--mdt-color-primary)]">Public-first</span>
              <span>Copy without login</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-display font-display leading-tight text-mdt-text">Compose, remix, and ship agents.md fast</h1>
              <p className="text-body text-mdt-muted max-w-2xl">
                Copy battle-tested snippets and templates, preview in the builder, and export with confidence. Keyboard-first flows keep you moving; light/dark stay in lockstep.
              </p>
            </div>

            <form action="/browse" className="grid gap-3 rounded-mdt-lg border border-mdt-border bg-[color:var(--mdt-color-surface)] p-4 shadow-mdt-md sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="space-y-2">
                <label className="text-caption text-mdt-muted" htmlFor="hero-search">
                  Search snippets, templates, agents.md
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id="hero-search"
                    name="q"
                    className="w-full rounded-mdt-md border border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] px-3 py-3 text-sm shadow-mdt-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]"
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
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button type="submit">Browse library</Button>
                <Button variant="secondary" asChild>
                  <Link href="#build-in-60s">Build in 60s</Link>
                </Button>
              </div>
            </form>

            <div className="grid gap-3 sm:grid-cols-3">
              {proof.map((item) => (
                <Card key={item.label} className="space-y-1 bg-[color:var(--mdt-color-surface)]">
                  <p className="text-caption text-mdt-muted">{item.label}</p>
                  <p className="text-h2 font-display text-mdt-text">{item.value}</p>
                  <p className="text-sm text-mdt-muted">{item.hint}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <Card className="space-y-5 border-mdt-border bg-[color:var(--mdt-color-surface)] shadow-mdt-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-mdt-muted">Live builder preview</p>
                  <h2 className="text-h3 font-display">Structured agents.md</h2>
                </div>
                <Button size="sm" variant="secondary" asChild>
                  <Link href="/builder">Open builder</Link>
                </Button>
              </div>
              <div className="space-y-3 rounded-mdt-lg border border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] p-4 shadow-mdt-sm">
                <div className="flex items-center gap-2 text-sm text-mdt-muted">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--mdt-color-success)]" aria-hidden />
                  Live preview ready - autosaves disabled for anon
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { title: "Cache intent", subtitle: "edge / safe" },
                    { title: "Guardrails", subtitle: "sanitized markdown" },
                    { title: "Sections", subtitle: "7 building blocks" },
                    { title: "Status", subtitle: "ready to export" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-mdt-md border border-mdt-border bg-[color:var(--mdt-color-surface)] px-3 py-2">
                      <p className="text-sm font-semibold text-mdt-text">{item.title}</p>
                      <p className="text-xs text-mdt-muted">{item.subtitle}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2">
                  <div className="h-2 w-full rounded-md bg-[rgba(54,214,255,0.22)]" />
                  <div className="h-2 w-[82%] rounded-md bg-[rgba(124,243,195,0.18)]" />
                  <div className="h-2 w-[64%] rounded-md bg-[rgba(30,168,231,0.16)]" />
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-12 space-y-12">
        <section className="grid gap-6 rounded-mdt-lg border border-mdt-border bg-[color:var(--mdt-color-surface)] p-6 shadow-mdt-md md:grid-cols-[1.4fr_1fr]" id="build-in-60s">
          <div className="space-y-3">
            <p className="text-caption text-mdt-muted">Build in 60 seconds</p>
            <h3 className="text-h2 font-display">Guided, keyboard-first path</h3>
            <div className="space-y-4">
              {buildSteps.map((step, idx) => (
                <div key={step.title} className="flex gap-3 rounded-mdt-md border border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--mdt-color-primary-soft)] text-sm font-semibold text-[color:var(--mdt-color-primary-strong)]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-mdt-text">{step.title}</p>
                    <p className="text-sm text-mdt-muted">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/builder">Start guided build</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/browse">Browse library</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-mdt-md border border-dashed border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] p-4 shadow-mdt-sm">
            <p className="text-caption text-mdt-muted">Quality signals</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Live preview", "Copy without login", "Keyboard shortcuts", "Light & dark"].map((label) => (
                <div key={label} className="rounded-mdt-md border border-mdt-border bg-[color:var(--mdt-color-surface)] px-3 py-2 text-sm text-mdt-text shadow-mdt-sm">
                  {label}
                </div>
              ))}
            </div>
            <div className="rounded-mdt-md bg-[color:var(--mdt-color-surface)] p-3 text-sm text-mdt-muted">
              Use a template jumps to curated rails, and the bottom nav keeps Builder one tap away on mobile.
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2" id="features">
          {features.map((feature) => (
            <Card key={feature.title} className="space-y-2 bg-[color:var(--mdt-color-surface)]">
              <h4 className="text-h3 font-display">{feature.title}</h4>
              <p className="text-body-sm text-mdt-muted">{feature.desc}</p>
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
                  className="rounded-mdt-pill border border-mdt-border px-3 py-1 text-sm text-mdt-text transition hover:-translate-y-[1px] hover:border-mdt-border-strong hover:shadow-mdt-sm"
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
                    className="flex items-center justify-between rounded-lg border border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] px-3 py-3 text-sm"
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

            <Card className="space-y-3 border border-dashed border-mdt-border bg-[rgba(0,87,217,0.04)] dark:bg-[color:var(--mdt-color-surface-subtle)]">
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

        <section className="grid gap-4 rounded-mdt-lg border border-mdt-border bg-[color:var(--mdt-color-surface)] p-6 shadow-mdt-md md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-caption text-mdt-muted">Teams are already shipping</p>
            <h3 className="text-h3">Social proof from builders</h3>
          </div>
          <div className="grid gap-3">
            {socialProof.map((item) => (
              <div key={item.name} className="rounded-mdt-md border border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] p-3 text-sm text-mdt-text">
                <p className="text-mdt-text">&quot;{item.quote}&quot;</p>
                <p className="text-xs text-mdt-muted">{item.name} - {item.role}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-4xl rounded-mdt-lg border border-mdt-border bg-[color:var(--mdt-color-surface)] p-10 text-center shadow-mdt-md space-y-4">
          <h2 className="text-h2 font-display text-mdt-text">Start building now</h2>
          <p className="mt-3 text-body text-mdt-muted">
            Assemble an agents.md with public snippets and templates, then copy or download. Sign in later to save and keep favorites in sync across projects.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/builder">Open builder</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/browse">Browse library</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
