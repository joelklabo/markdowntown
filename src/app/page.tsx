import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { SectionComposer } from "@/components/SectionComposer";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

export default async function Home() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-mdt-bg-soft text-mdt-text">
      <header className="border-b border-mdt-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <BrandLogo />
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-mdt-pill bg-mdt-bg px-3 py-1 text-sm font-medium text-mdt-muted sm:flex">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt={user.name ?? "avatar"}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  )}
                  <span>{user.username ?? user.name ?? user.email ?? "Signed in"}</span>
                </div>
                <form action="/api/auth/signout" method="post">
                  <Button variant="ghost" size="sm" type="submit">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/api/auth/signin?callbackUrl=/">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/api/auth/signin?callbackUrl=/">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {!user && (
        <div className="border-b border-mdt-border bg-white">
          <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 md:flex-row md:items-center md:py-16">
            <div className="flex-1 space-y-4">
              <Pill>New · Build your agent town</Pill>
              <h1 className="text-display text-mdt-text">
                Your little town of reusable Markdown prompts.
              </h1>
              <p className="text-body text-mdt-muted max-w-xl">
                MarkdownTown lets you collect, remix, and reuse markdown sections for AI agents.
                Snap blocks together like houses on a street.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/api/auth/signin?callbackUrl=/">Start composing</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/api/auth/signin?callbackUrl=/">Browse the town</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill>Secure by default</Pill>
                <Pill tone="yellow">Reusable sections</Pill>
                <Pill>Live preview</Pill>
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

            <div className="mt-12 grid gap-6 rounded-mdt-lg border border-mdt-border bg-white p-6 shadow-mdt-sm md:grid-cols-3">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-h2">How it works</h3>
                <ol className="list-decimal space-y-2 pl-4 text-body text-mdt-muted">
                  <li>Sign in with GitHub to create your private town.</li>
                  <li>Add sections (system, style, tools) and edit them with live preview.</li>
                  <li>Remix sections into your agents or export as markdown.</li>
                </ol>
              </div>
              <div className="flex flex-col gap-3 rounded-mdt-md bg-mdt-bg p-4">
                <span className="text-body font-semibold">Ready to start?</span>
                <Button asChild>
                  <Link href="/api/auth/signin?callbackUrl=/">Sign in with GitHub</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/api/auth/signin?callbackUrl=/">Browse your town</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {user ? (
          <SectionComposer />
        ) : (
          <div className="mx-auto max-w-2xl rounded-mdt-lg border border-dashed border-mdt-border bg-white p-10 text-center shadow-mdt-sm space-y-4">
            <h2 className="text-h2 font-semibold text-mdt-text">Sign in to start composing</h2>
            <p className="mt-3 text-body text-mdt-muted">
              Connect your GitHub account to start creating and mixing markdown sections with live
              preview. Your sections stay private to your account.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link href="/api/auth/signin?callbackUrl=/">Sign in with GitHub</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
