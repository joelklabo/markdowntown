import Link from "next/link";
import dynamic from "next/dynamic";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LibraryCard } from "@/components/LibraryCard";
import { sampleItems, sampleTags, type SampleItem } from "@/lib/sampleContent";
import { listTopTags } from "@/lib/publicTags";
import { listPublicItems, type PublicItem } from "@/lib/publicItems";

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
  const session = await getSession();
  const user = session?.user;
  const liveTags = await listTopTags(18, 30);
  const tags = liveTags.length ? liveTags : sampleTags;
  const liveItems = await listPublicItems({ limit: 12, sort: "copies" });
  const mostCopiedFiles = await listPublicItems({ limit: 3, sort: "copies", type: "file" });
  const newThisWeek = await listPublicItems({ limit: 6, sort: "recent" });
  const templateSpotlight = await listPublicItems({ limit: 6, sort: "copies", type: "template" });

  const normalizeItem = (item: PublicItem): SampleItem => ({
    id: item.id,
    slug: item.slug ?? undefined,
    title: item.title,
    description: item.description || "Markdown snippet",
    tags: item.tags,
    stats: item.stats,
    type: item.type,
  });

  const items: SampleItem[] = (liveItems.length ? liveItems : sampleItems).map((i) =>
    ("type" in i && "stats" in i ? normalizeItem(i as PublicItem) : (i as SampleItem))
  );

  const trending = items
    .slice()
    .sort((a, b) => b.stats.copies - a.stats.copies || b.stats.views - a.stats.views)
    .slice(0, 6);

  const copiedFiles: SampleItem[] = (mostCopiedFiles.length ? mostCopiedFiles : sampleItems)
    .filter((i) => ("type" in i ? (i as PublicItem).type === "file" : (i as SampleItem).type === "file"))
    .slice(0, 3)
    .map((i) => ("type" in i && "stats" in i ? normalizeItem(i as PublicItem) : (i as SampleItem)));

  const recentItems: SampleItem[] = (newThisWeek.length ? newThisWeek : sampleItems)
    .slice(0, 6)
    .map((i) => ("type" in i && "stats" in i ? normalizeItem(i as PublicItem) : (i as SampleItem)));

  const spotlightTemplates: SampleItem[] = (templateSpotlight.length ? templateSpotlight : sampleItems)
    .filter((i) => ("type" in i ? (i as PublicItem).type === "template" : (i as SampleItem).type === "template"))
    .slice(0, 6)
    .map((i) => ("type" in i && "stats" in i ? normalizeItem(i as PublicItem) : (i as SampleItem)));

  return (
    <div className="min-h-screen bg-mdt-bg-soft text-mdt-text dark:bg-mdt-bg-soft-dark dark:text-mdt-text-dark">
      {!user && (
        <div className="border-b border-mdt-border bg-white dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
          <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
            <div className="flex-1 space-y-4">
              <Pill>New · agents.md made reusable</Pill>
              <h1 className="text-display text-mdt-text">Build one source of truth for your agents.md.</h1>
              <p className="text-body text-mdt-muted max-w-xl">
                Browse ready-to-use snippets and templates, assemble an agents.md in minutes, then copy or download—all without signing in. Log in only when you want to save, vote, or comment.
              </p>
              <form action="/browse" className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  name="q"
                  className="w-full rounded-lg border border-mdt-border px-3 py-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark"
                  placeholder="Search snippets, templates, agents.md…"
                  aria-label="Search snippets and templates"
                />
                <Button type="submit">Search library</Button>
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
            </div>

            <div className="mt-6 flex-1 md:mt-0">
              <Card className="space-y-3">
                <div className="flex items-center gap-2">
                  <Pill tone="yellow">Section</Pill>
                  <span className="text-body-sm text-mdt-muted">system / style / tools</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-24 rounded-md bg-mdt-yellow" />
                  <div className="h-2 w-40 rounded-md bg-[rgba(0,87,217,0.15)]" />
                  <div className="h-2 w-32 rounded-md bg-[rgba(0,87,217,0.08)]" />
                </div>
              </Card>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 pb-14 space-y-12">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="h-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-mdt-lg bg-[rgba(0,87,217,0.08)]" />
                  <span className="text-h3">Compose fast</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Capture markdown sections once and drop them into any agent or toolchain. Live preview keeps output honest.
                </p>
              </Card>
              <Card className="h-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-mdt-lg bg-[rgba(255,204,0,0.18)]" />
                  <span className="text-h3">Stay organized</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Lists, ordering, and tags keep your system prompts, tools, and style blocks tidy.
                </p>
              </Card>
              <Card className="h-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-mdt-lg bg-[rgba(255,51,51,0.14)]" />
                  <span className="text-h3">Own your data</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Auth via GitHub when you want to save; otherwise stay anonymous and keep exporting freely.
                </p>
              </Card>
            </div>

            <div className="grid gap-6 rounded-mdt-lg border border-mdt-border bg-white p-6 shadow-mdt-sm md:grid-cols-3 dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-h2">How it works</h3>
                <ol className="list-decimal space-y-2 pl-4 text-body text-mdt-muted">
                  <li>Browse public snippets and templates—copy or download without signing in.</li>
                  <li>Open the builder to pick a template, add snippets, reorder, and preview agents.md.</li>
                  <li>Copy or download the final file; sign in if you want to save, vote, or comment.</li>
                </ol>
              </div>
              <div className="flex flex-col gap-3 rounded-mdt-md bg-mdt-bg p-4">
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
                    <Link href="/api/auth/signin?callbackUrl=/">Sign in with GitHub</Link>
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

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {user ? (
          <SectionComposerLazy />
        ) : (
          <div className="mx-auto max-w-2xl rounded-mdt-lg border border-dashed border-mdt-border bg-white p-10 text-center shadow-mdt-sm space-y-4 dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
            <h2 className="text-h2 font-semibold text-mdt-text">Start building now</h2>
            <p className="mt-3 text-body text-mdt-muted">
              Assemble an agents.md with public snippets and templates, then copy or download. Sign in
              later to save and keep favorites in sync across projects.
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
