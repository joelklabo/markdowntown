"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

export function SiteNav({ user }: { user?: { name?: string | null; username?: string | null; email?: string | null; image?: string | null } | null }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-mdt-border bg-white/80 backdrop-blur-md dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-mdt-muted sm:flex dark:text-mdt-muted-dark">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    active
                      ? "text-mdt-text dark:text-mdt-text-dark bg-mdt-bg/80 dark:bg-mdt-bg-dark"
                      : "hover:text-mdt-text dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2 rounded-mdt-pill bg-mdt-bg px-3 py-1 text-sm font-medium text-mdt-muted dark:bg-mdt-bg-soft-dark dark:text-mdt-text-dark">
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
                <Link href="/builder">Start building</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
