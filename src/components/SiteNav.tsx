"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/browse", label: "Browse" },
  { href: "/templates", label: "Templates" },
  { href: "/builder", label: "Builder" },
  { href: "/tags", label: "Tags" },
  { href: "/docs", label: "Docs" },
];

type User = { name?: string | null; username?: string | null; email?: string | null; image?: string | null } | null;

export function SiteNav({ user }: { user?: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  }

  const bottomNavItems = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/templates", label: "Templates" },
    { href: "/builder", label: "Builder" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-mdt-border bg-white/90 backdrop-blur-md shadow-sm dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo />
            </Link>
            <nav className="hidden items-center gap-3 text-sm font-medium text-mdt-muted md:flex dark:text-mdt-muted-dark">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-2 py-1 transition-colors ${
                      active
                        ? "bg-mdt-bg/80 text-mdt-text dark:bg-mdt-bg-dark dark:text-mdt-text-dark"
                        : "hover:text-mdt-text dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
            <form onSubmit={onSearch} className="hidden min-w-[260px] items-center gap-2 rounded-md border border-mdt-border bg-white px-3 py-2 text-sm shadow-sm md:flex dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark">
              <input
                className="w-full bg-transparent text-mdt-text outline-none placeholder:text-mdt-muted dark:text-mdt-text-dark dark:placeholder:text-mdt-muted-dark"
                placeholder="Search snippets, templates…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search"
              />
            </form>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2 rounded-mdt-pill bg-mdt-bg px-3 py-1 text-sm font-medium text-mdt-muted dark:bg-mdt-bg-soft-dark dark:text-mdt-text-dark">
                {user.image && (
                  <Image src={user.image} alt={user.name ?? "avatar"} width={28} height={28} className="rounded-full" />
                )}
                <span>{user.username ?? user.name ?? user.email ?? "Signed in"}</span>
                <form action="/api/auth/signout" method="post">
                  <Button variant="ghost" size="sm" type="submit">
                    Sign out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/api/auth/signin?callbackUrl=/">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/builder">Use a template</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-mdt-border bg-white/95 px-2 py-2 text-xs font-medium text-mdt-muted shadow-mdt-sm md:hidden dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark dark:text-mdt-muted-dark">
        {bottomNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-md px-2 py-1 ${
                active ? "text-mdt-text dark:text-mdt-text-dark" : "hover:text-mdt-text dark:hover:text-white"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
