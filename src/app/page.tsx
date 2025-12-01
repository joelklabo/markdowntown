import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SectionComposer } from "@/components/SectionComposer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LibraryCard } from "@/components/LibraryCard";
import { sampleItems, sampleTags } from "@/lib/sampleContent";

export default async function Home() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-mdt-bg-soft text-mdt-text dark:bg-mdt-bg-soft-dark dark:text-mdt-text-dark">
      {!user && (
        <div className="border-b border-mdt-border bg-white dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
          <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 md:flex-row md:items-center md:py-16">
            <div className="flex-1 space-y-4">
              <Pill>New · agents.md made reusable</Pill>
              <h1 className="text-display text-mdt-text">Build one source of truth for your agents.md.</h1>
              <p className="text-body text-mdt-muted max-w-xl">
                Browse ready-to-use snippets and templates, assemble the perfect agents.md with a builder,
                then copy or download—all without signing in. Log in when you want to save, vote, or comment.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/builder">Start builder</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/browse">Browse library</Link>
                </Button>
              </div>
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

          <section className="mx-auto max-w-6xl px-4 pb-14">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="h-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-mdt-lg bg-[rgba(0,87,217,0.08)]" />
                  <span className="text-h3">Compose fast</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Capture markdown sections once and drop them into any agent or toolchain.
                  Live preview keeps output honest.
                </p>
              </Card>
              <Card className="h-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-mdt-lg bg-[rgba(255,204,0,0.18)]" />
                  <span className="text-h3">Stay organized</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  A left-rail list and ordering keep your system prompts, tools, and style blocks tidy.
                </p>
              </Card>
              <Card className="h-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-mdt-lg bg-[rgba(255,51,51,0.14)]" />
                  <span className="text-h3">Own your data</span>
                </div>
                <p className="text-body-sm text-mdt-muted">
                  Auth via GitHub, backed by your own database. Export and iterate without losing history.
                </p>
              </Card>
            </div>

            <div className="mt-12 grid gap-6 rounded-mdt-lg border border-mdt-border bg-white p-6 shadow-mdt-sm md:grid-cols-3 dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-h2">How it works</h3>
                <ol className="list-decimal space-y-2 pl-4 text-body text-mdt-muted">
                  <li>Browse public snippets and templates—copy or download without signing in.</li>
                  <li>Open the builder to pick a template, add snippets, reorder, and preview agents.md.</li>
                  <li>Copy or download the final file; sign in only if you want to save, vote, or comment.</li>
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

            <div className="mt-12 space-y-8">
              <div className="space-y-3">
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
                  {sampleItems
                    .filter((i) => i.badge === "trending" || i.badge === "staff")
                    .slice(0, 3)
                    .map((item) => (
                      <LibraryCard key={item.id} item={item} />
                    ))}
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
                    {sampleItems
                      .filter((i) => i.type === "file")
                      .sort((a, b) => b.stats.copies - a.stats.copies)
                      .slice(0, 3)
                      .map((item) => (
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
                            <Link href={`/files/${item.id}`}>Copy</Link>
                          </Button>
                        </div>
                      ))}
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
                    {sampleTags.slice(0, 12).map(({ tag, count }) => (
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
            </div>
          </section>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {user ? (
          <SectionComposer />
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
