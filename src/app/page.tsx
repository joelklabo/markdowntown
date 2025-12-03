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
        <div className="border-b border-mdt-border bg-mdt-surface/92 backdrop-blur">
          <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div className="flex-1 space-y-6">
              <Pill tone="blue">Public by default</Pill>
              <div className="space-y-3">
                <h1 className="text-display font-display text-mdt-text">
                  Calm, capable workflows for your agents.md
                </h1>
                <p className="text-body text-mdt-muted max-w-xl">
                  Copy any snippet or template without signing in. When you are ready, assemble in the builder, preview, and export with confidence.
                </p>
              </div>
              <form action="/browse" className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  name="q"
                  className="w-full rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-3 py-3 text-sm shadow-mdt-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]"
                  placeholder="Search snippets, templates, agents.md…"
                  aria-label="Search snippets and templates"
                />
                <Button type="submit">Search</Button>
                <Button variant="secondary" asChild>
                  <Link href="#build-in-60s">Build in 60s</Link>
                </Button>
              </form>
              <div className="flex flex-wrap gap-2 text-sm text-mdt-muted">
                <span className="rounded-mdt-pill bg-mdt-surface-subtle px-3 py-2 shadow-mdt-sm">Copy without login</span>
                <span className="rounded-mdt-pill bg-mdt-surface-subtle px-3 py-2 shadow-mdt-sm">Keyboard-first</span>
                <span className="rounded-mdt-pill bg-mdt-surface-subtle px-3 py-2 shadow-mdt-sm">Live preview</span>
              </div>
            </div>

            <div className="relative mt-4 flex-1 md:mt-0">
              <Card className="space-y-4 border-mdt-border bg-gradient-to-br from-[rgba(54,214,255,0.10)] via-[rgba(124,243,195,0.08)] to-[rgba(30,168,231,0.04)] shadow-mdt-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-caption text-mdt-muted">Preview</p>
                    <span className="text-h3 font-display text-mdt-text">agents.md builder</span>
                  </div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href="/builder">Open builder</Link>
                  </Button>
                </div>
                <div className="rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-4 shadow-mdt-sm space-y-3">
                  <div className="space-y-2">
                    <div className="h-2 w-28 rounded-md bg-[rgba(54,214,255,0.28)]" />
                    <div className="h-2 w-52 rounded-md bg-[rgba(124,243,195,0.24)]" />
                    <div className="h-2 w-40 rounded-md bg-[rgba(30,168,231,0.18)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-mdt-muted">
                    <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-3 py-2">
                      <p className="font-semibold text-mdt-text">Cache intent</p>
                      <p className="text-[12px] text-mdt-muted">cacheable · edge</p>
                    </div>
                    <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-3 py-2">
                      <p className="font-semibold text-mdt-text">Status</p>
                      <p className="text-[12px] text-mdt-muted">live preview ready</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 pb-14 space-y-10">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Compose fast", desc: "Drop in battle-tested snippets and templates; preview instantly." },
                { title: "Stay organized", desc: "Tags, ordering, and search keep your library tidy." },
                { title: "Own your data", desc: "Copy/export anonymously; sign in only to save and vote." },
              ].map((item) => (
                <Card key={item.title} className="h-full space-y-3 bg-mdt-surface">
                  <span className="text-h3 font-display">{item.title}</span>
                  <p className="text-body-sm text-mdt-muted">{item.desc}</p>
                </Card>
              ))}
            </div>

            <div id="build-in-60s" className="grid gap-6 rounded-mdt-lg border border-mdt-border bg-mdt-surface p-6 shadow-mdt-md md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3">
                <p className="text-caption text-mdt-muted">Build in 60 seconds</p>
                <h3 className="text-h2 font-display">Try the guided path</h3>
                <ol className="list-decimal space-y-2 pl-4 text-body text-mdt-muted">
                  <li>Pick a template (or start blank).</li>
                  <li>Add snippets from the library, reorder, and preview.</li>
                  <li>Copy or download agents.md; save if you want to keep history.</li>
                </ol>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/builder">Start guided build</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/browse">Browse library</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-mdt-md border border-dashed border-mdt-border bg-mdt-surface-subtle p-4 shadow-mdt-sm space-y-3">
                <p className="text-caption text-mdt-muted">Proof</p>
                <div className="flex flex-wrap gap-2">
                  {["Live preview", "Keyboard-first", "Copy without login", "Light/Dark"].map((label) => (
                    <span key={label} className="rounded-mdt-pill bg-mdt-surface px-3 py-2 text-sm text-mdt-text shadow-mdt-sm">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-mdt-muted">
                  Top templates updated weekly · Analytics-free for public copies · Export ready for GitHub README or CLI tools.
                </div>
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
