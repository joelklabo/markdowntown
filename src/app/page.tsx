import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LibraryCard } from "@/components/LibraryCard";
import { sampleItems, sampleTags, type SampleItem } from "@/lib/sampleContent";

const SectionComposerLazy = dynamic(
  () => import("@/components/SectionComposer").then((m) => m.SectionComposer),
  {
    loading: () => (
      <div className="rounded-2xl border border-mdt-border bg-white p-6 text-sm text-mdt-muted shadow-sm dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
        Loading composer…
      </div>
    ),
  }
);

export default async function Home() {
  const user = null;
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
      {!user && (
        <div className="border-b border-mdt-border bg-mdt-surface/90 backdrop-blur">
          <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="flex-1 space-y-5">
              <Pill>Focus / Flow · new look</Pill>
              <div className="space-y-2">
                <h1 className="text-display font-display text-mdt-text">Build one source of truth for your agents.md</h1>
                <p className="text-body text-mdt-muted max-w-xl">
                  Compose faster with ready snippets and templates, live preview, and keyboard-first navigation. Copy without logging in; sign in only to save and vote.
                </p>
              </div>
              <form action="/browse" className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  name="q"
                  className="w-full rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-3 py-3 text-sm shadow-mdt-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdt-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]"
                  placeholder="Search snippets, templates, agents.md…"
                  aria-label="Search snippets and templates"
                />
                <Button type="submit">Search</Button>
                <Button variant="secondary" asChild>
                  <Link href="#template-spotlight">Use a template</Link>
                </Button>
              </form>
              <div className="flex flex-wrap gap-2">
                <Pill>Copy without login</Pill>
                <Pill tone="yellow">Templates with placeholders</Pill>
                <Pill>Live preview</Pill>
                <Pill tone="green">Export to agents.md</Pill>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-mdt-muted">
                <span className="rounded-mdt-pill bg-mdt-surface-strong px-3 py-2 shadow-mdt-sm">⌘K command palette</span>
                <span className="rounded-mdt-pill bg-mdt-surface-strong px-3 py-2 shadow-mdt-sm">Keyboard jump numbers</span>
                <span className="rounded-mdt-pill bg-mdt-surface-strong px-3 py-2 shadow-mdt-sm">SPA perf hints</span>
              </div>
            </div>

            <div className="relative mt-4 flex-1 md:mt-0">
              <Card className="space-y-4 bg-gradient-to-br from-[rgba(54,214,255,0.08)] via-[rgba(124,243,195,0.05)] to-[rgba(30,168,231,0.02)] border-mdt-border shadow-mdt-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill tone="yellow">Section</Pill>
                    <span className="text-body-sm text-mdt-muted">system / style / tools</span>
                  </div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href="/builder">Open builder</Link>
                  </Button>
                </div>
                <div className="rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-4 shadow-mdt-sm">
                  <div className="space-y-2">
                    <div className="h-2 w-28 rounded-md bg-[rgba(54,214,255,0.25)]" />
                    <div className="h-2 w-52 rounded-md bg-[rgba(90,161,255,0.18)]" />
                    <div className="h-2 w-40 rounded-md bg-[rgba(30,168,231,0.14)]" />
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-mdt-muted">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[color:var(--mdt-color-primary)]" />
                      Live preview ready
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[color:var(--mdt-color-accent)]" />
                      Cache intent: cacheable
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 pb-14 space-y-10">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="h-full space-y-3 bg-mdt-surface">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-mdt-md bg-[rgba(54,214,255,0.12)]" />
                  <span className="text-h3 font-display">Compose fast</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Capture markdown sections once and drop them into any agent or toolchain. Live preview keeps output honest.
                </p>
              </Card>
              <Card className="h-full space-y-3 bg-mdt-surface">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-mdt-md bg-[rgba(124,243,195,0.14)]" />
                  <span className="text-h3 font-display">Stay organized</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Lists, ordering, and tags keep your system prompts, tools, and style blocks tidy.
                </p>
              </Card>
              <Card className="h-full space-y-3 bg-mdt-surface">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-mdt-md bg-[rgba(255,107,107,0.12)]" />
                  <span className="text-h3 font-display">Own your data</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Auth via GitHub when you want to save; otherwise stay anonymous and keep exporting freely.
                </p>
              </Card>
            </div>

            <div className="grid gap-6 rounded-mdt-lg border border-mdt-border bg-mdt-surface p-6 shadow-mdt-md md:grid-cols-3">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-h2 font-display">How it works</h3>
                <ol className="list-decimal space-y-2 pl-4 text-body text-mdt-muted">
                  <li>Browse public snippets and templates—copy or download without signing in.</li>
                  <li>Open the builder to pick a template, add snippets, reorder, and preview agents.md.</li>
                  <li>Copy or download the final file; sign in if you want to save, vote, or comment.</li>
                </ol>
              </div>
              <div className="flex flex-col gap-3 rounded-mdt-md bg-mdt-surface-strong p-4 shadow-mdt-sm">
                <span className="text-body font-semibold">Ready to start?</span>
                <Button asChild>
                  <Link href="/builder">Open builder</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/browse">Browse library</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-8" id="featured">
              <div className="space-y-3" id="templates">
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
                        className="flex items-center justify-between rounded-lg border border-mdt-border px-3 py-3 text-sm dark:border-mdt-border-dark"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Pill tone="blue">agents.md</Pill>
                            {item.badge && <Pill tone="yellow">{item.badge}</Pill>}
                          </div>
                          <p className="font-semibold text-mdt-text dark:text-mdt-text-dark">{item.title}</p>
                          <p className="text-xs text-mdt-muted dark:text-mdt-muted-dark">
                            {item.stats.copies.toLocaleString()} copies · {item.stats.views.toLocaleString()} views
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/files/${item.slug ?? item.id}`}>Copy</Link>
                        </Button>
                      </div>
                    ))}
                    {copiedFiles.length === 0 && (
                      <p className="text-sm text-mdt-muted">No public files yet.</p>
                    )}
                  </div>
                </Card>

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
                        className="rounded-mdt-pill border border-mdt-border px-3 py-1 text-sm text-mdt-text transition hover:-translate-y-[1px] hover:border-indigo-300 hover:shadow-mdt-sm dark:border-mdt-border-dark dark:text-mdt-text-dark"
                      >
                        #{tag} · {count}
                      </Link>
                    ))}
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

              <Card className="space-y-3 border border-dashed border-mdt-border bg-[rgba(0,87,217,0.04)] p-5 dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3">Why sign in</h3>
                  <Pill tone="yellow">Optional</Pill>
                </div>
                <ul className="list-disc space-y-2 pl-5 text-sm text-mdt-muted dark:text-mdt-muted-dark">
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
          </section>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-10 space-y-10">
        {user ? (
          <SectionComposerLazy />
        ) : (
          <div className="mx-auto max-w-3xl rounded-mdt-lg border border-mdt-border bg-mdt-surface p-10 text-center shadow-mdt-md space-y-4">
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
        )}
      </div>
    </div>
  );
}
