"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { COMMAND_PALETTE_OPEN_EVENT } from "./CommandPalette";
import { sampleTags } from "@/lib/sampleContent";
import { track } from "@/lib/analytics";

const links = [
  { href: "/browse", label: "Browse" },
  { href: "/templates", label: "Templates" },
  { href: "/tags", label: "Tags" },
  { href: "/builder", label: "Builder" },
  { href: "/docs", label: "Docs" },
];

type User = { name?: string | null; username?: string | null; email?: string | null; image?: string | null } | null;

export function SiteNav({ user }: { user?: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showOverflowSheet, setShowOverflowSheet] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const ctaHref = pathname === "/" ? "#templates" : "/templates";

  function openCommandPalette(origin: string) {
    track("command_palette_entry_click", { origin });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT, { detail: { origin } }));
    }
  }

  function persistRecent(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((v) => v !== trimmed)].slice(0, 6);
      try {
        localStorage.setItem("mdt_recent_searches", JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }

  function buildBrowseHref(overrides?: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);
    Object.entries(overrides ?? {}).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const search = params.toString();
    return search ? `/browse?${search}` : "/browse";
  }

  function applyQuickFilter(overrides: Record<string, string>, source: string) {
    const destination = buildBrowseHref(overrides);
    const q = query.trim();
    persistRecent(q);
    track("nav_search_quick_filter", { source, q: q || undefined, ...overrides });
    router.push(destination);
    setShowMobileSearch(false);
    setShowOverflowSheet(false);
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    persistRecent(q);
    track("nav_search_submit", { q });
    router.push(buildBrowseHref());
    setShowMobileSearch(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShowMobileSearch(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (showMobileSearch) {
          e.preventDefault();
          setShowMobileSearch(false);
        }
        if (showOverflowSheet) {
          e.preventDefault();
          setShowOverflowSheet(false);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMobileSearch, showOverflowSheet]);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    try {
      const stored = localStorage.getItem("mdt_recent_searches");
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(parsed);
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, [hydrated]);

  useEffect(() => {
    if (showMobileSearch || showOverflowSheet) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showMobileSearch, showOverflowSheet]);

  const bottomNavItems = [
    { href: "/", label: "Home", icon: "🏠", type: "link" as const },
    { href: "/browse", label: "Browse", icon: "🔎", type: "link" as const },
    { href: "/templates", label: "Templates", icon: "📄", type: "link" as const },
    { href: "/builder", label: "Builder", icon: "🛠️", type: "link" as const },
    { label: "Search", icon: "⌘K", type: "search" as const },
  ];

  const quickFilters = [
    { label: "Trending", params: { sort: "trending" } },
    { label: "Snippets", params: { type: "snippet" } },
    { label: "Templates", params: { type: "template" } },
    { label: "agents.md", params: { type: "file" } },
  ];

  const overflowLinks = [
    { href: "/docs", label: "Docs" },
    { href: "/changelog", label: "Changelog" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "https://github.com/joelklabo/markdowntown", label: "GitHub", external: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-mdt-border bg-[color:var(--mdt-color-surface-raised)]/90 backdrop-blur-lg shadow-mdt-md">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto,1fr,auto] items-center gap-2 px-4 py-3 md:grid-cols-[auto,auto,1fr] md:gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="MarkdownTown home">
              <BrandLogo asLink={false} />
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-mdt-border bg-mdt-surface text-mdt-muted shadow-mdt-sm transition hover:text-mdt-text md:hidden"
              onClick={() => {
                setShowMobileSearch(true);
                track("nav_search_open", { source: "mobile_top" });
                setTimeout(() => inputRef.current?.focus(), 10);
              }}
              aria-label="Search"
              aria-expanded={showMobileSearch}
              aria-keyshortcuts="/"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </button>
          </div>

          <nav className="hidden items-center justify-center gap-3 text-sm font-medium text-mdt-muted md:flex" aria-label="Primary">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 transition ${
                    active
                      ? "bg-mdt-surface-subtle text-mdt-text shadow-mdt-sm"
                      : "hover:text-mdt-text"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]`}
                  onClick={() => track("nav_click", { href: link.href, placement: "desktop" })}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2 flex-nowrap">
            <form
              role="search"
              onSubmit={onSearch}
              className="hidden min-w-[240px] max-w-[360px] flex-1 items-center gap-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-3 py-2 text-sm shadow-mdt-sm md:flex"
            >
              <input
                className="w-full bg-transparent text-mdt-text outline-none placeholder:text-mdt-muted"
                placeholder="Search snippets, templates…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search"
                ref={inputRef}
                aria-keyshortcuts="/"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="hidden whitespace-nowrap md:inline-flex"
              onClick={() => openCommandPalette("desktop_nav_button")}
              aria-keyshortcuts="Meta+K,Control+K"
            >
              Command <span className="text-[11px] text-mdt-muted">⌘K</span>
            </Button>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            {user ? (
              <div className="flex items-center gap-2 rounded-mdt-pill bg-mdt-surface-subtle px-3 py-1 text-sm font-medium text-mdt-muted">
                {user.image && (
                  <Image src={user.image} alt={user.name ?? "avatar"} width={28} height={28} className="rounded-full" />
                )}
                <span className="hidden sm:inline whitespace-nowrap text-mdt-text">
                  {user.username ?? user.name ?? user.email ?? "Signed in"}
                </span>
                <form action="/api/auth/signout" method="post">
                  <Button variant="ghost" size="sm" type="submit">
                    Sign out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex whitespace-nowrap" asChild>
                  <Link
                    href={`/signin?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                    onClick={() => track("nav_click", { href: "signin", placement: "desktop" })}
                  >
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" className="whitespace-nowrap" asChild>
                  <Link href={ctaHref} onClick={() => track("nav_click", { href: ctaHref, cta: "use_template", placement: "desktop" })}>
                    Use a template
                  </Link>
                </Button>
              </div>
            )}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-mdt-border bg-mdt-surface text-mdt-muted shadow-mdt-sm transition hover:text-mdt-text md:hidden"
              aria-label="Open menu"
              onClick={() => setShowOverflowSheet(true)}
            >
              <span aria-hidden="true">⋯</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-mdt-border bg-mdt-surface/95 px-2 py-2 text-xs font-medium text-mdt-muted shadow-mdt-lg backdrop-blur-md md:hidden"
        role="navigation"
        aria-label="Primary"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
      >
        {bottomNavItems.map((item) => {
          const active = item.type === "link" ? isActive(item.href ?? "") : false;
          return (
            <div key={item.label} className="flex-1">
              {item.type === "link" ? (
                <Link
                  href={item.href!}
                  className={`group flex h-14 min-h-[56px] flex-col items-center justify-center gap-1 rounded-md px-2 transition ${
                    active ? "text-mdt-text" : "hover:text-mdt-text"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]`}
                  onClick={() => track("nav_click", { href: item.href, placement: "bottom" })}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-[12px] leading-tight">{item.label}</span>
                  {active && <span className="mt-1 h-1 w-8 rounded-full bg-mdt-primary" aria-hidden />}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileSearch(true);
                    setTimeout(() => inputRef.current?.focus(), 10);
                    track("nav_search_open", { source: "bottom_nav" });
                  }}
                  className="flex h-14 min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-md px-2 text-mdt-text transition hover:text-mdt-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mdt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mdt-color-surface)]"
                  aria-label="Open search"
                  aria-keyshortcuts="/"
                >
                  <span className="text-xs font-mono" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-[12px] leading-tight">{item.label}</span>
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* Mobile search modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-40 bg-[color:var(--mdt-color-overlay)] backdrop-blur-sm md:hidden" role="dialog" aria-modal="true" aria-label="Search">
          <div className="absolute inset-x-3 top-16 rounded-2xl border border-mdt-border bg-mdt-surface p-4 shadow-mdt-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-mdt-text">Search</p>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="text-sm text-mdt-muted hover:text-mdt-text"
                aria-label="Close search"
              >
                Esc
              </button>
            </div>
            <form
              role="search"
              onSubmit={onSearch}
              className="flex flex-col gap-3 rounded-lg border border-mdt-border bg-mdt-surface px-3 py-2 text-sm shadow-mdt-sm"
            >
              <input
                ref={inputRef}
                className="w-full bg-transparent text-mdt-text outline-none placeholder:text-mdt-muted"
                placeholder="Search snippets, templates…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search"
                aria-keyshortcuts="/"
              />
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2 text-[11px] text-mdt-muted">
                  {sampleTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag.tag}
                      type="button"
                      className="rounded-md border border-mdt-border px-2 py-1 hover:text-mdt-text"
                      onClick={() => {
                        setQuery(tag.tag);
                        setTimeout(() => inputRef.current?.focus(), 10);
                        track("nav_search_suggestion_click", { tag: tag.tag, source: "quick_tags" });
                      }}
                    >
                      #{tag.tag}
                    </button>
                  ))}
                </div>
                <Button type="submit" size="sm">
                  Search
                </Button>
              </div>
            </form>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-mdt-muted">Quick filters</p>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <Button
                    key={filter.label}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-mdt-pill"
                    onClick={() => applyQuickFilter(filter.params, "mobile_search_filter")}
                  >
                    {filter.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-mdt-pill"
                  onClick={() => {
                    setShowMobileSearch(false);
                    openCommandPalette("mobile_search_sheet");
                  }}
                >
                  Command palette
                </Button>
              </div>
            </div>

            {(recentSearches.length > 0 || sampleTags.length > 0) && (
              <div className="mt-3 space-y-2">
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-mdt-muted">Recent</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          className="rounded-md border border-mdt-border px-2 py-1 text-sm text-mdt-text hover:bg-mdt-surface-subtle"
                          onClick={() => {
                            setQuery(term);
                            setTimeout(() => inputRef.current?.focus(), 10);
                            track("nav_search_suggestion_click", { term, source: "recent" });
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showOverflowSheet && (
        <div className="fixed inset-0 z-40 bg-[color:var(--mdt-color-overlay)] backdrop-blur-sm md:hidden" role="dialog" aria-modal="true" aria-label="More">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close menu overlay"
            onClick={() => setShowOverflowSheet(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-mdt-border bg-mdt-surface p-4 shadow-mdt-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-1.5 w-12 rounded-full bg-mdt-border" aria-hidden />
              <button
                type="button"
                className="text-sm text-mdt-muted hover:text-mdt-text"
                onClick={() => setShowOverflowSheet(false)}
                aria-expanded={showOverflowSheet}
              >
                Close
              </button>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowOverflowSheet(false);
                  openCommandPalette("mobile_overflow");
                }}
              >
                Command palette
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowOverflowSheet(false);
                  setShowMobileSearch(true);
                  setTimeout(() => inputRef.current?.focus(), 10);
                  track("nav_search_open", { source: "overflow" });
                }}
              >
                Search
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {overflowLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="rounded-lg border border-mdt-border px-3 py-2 text-sm font-semibold text-mdt-text transition hover:bg-mdt-surface-subtle"
                  onClick={() => {
                    setShowOverflowSheet(false);
                    track("nav_click", { href: link.href, placement: "overflow" });
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
