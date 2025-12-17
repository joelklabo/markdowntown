import Link from "next/link";
import { cn, focusRing, interactiveBase } from "@/lib/cn";

const navItems = [
  { href: "/atlas/platforms", label: "Platforms" },
  { href: "/atlas/concepts", label: "Concepts" },
  { href: "/atlas/recipes", label: "Recipes" },
  { href: "/atlas/compare", label: "Compare" },
  { href: "/atlas/changelog", label: "Changelog" },
];

export function AtlasSidebar() {
  return (
    <nav
      aria-label="Atlas"
      className="rounded-mdt-xl border border-mdt-border bg-mdt-surface shadow-mdt-sm"
    >
      <div className="px-mdt-4 py-mdt-3 border-b border-mdt-border">
        <div className="text-body-sm font-semibold text-mdt-text">Explore</div>
        <div className="text-body-xs text-mdt-muted">Docs-as-data for agent behavior.</div>
      </div>
      <ul className="p-mdt-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "block rounded-mdt-md px-mdt-3 py-mdt-2 text-body-sm text-mdt-text hover:bg-mdt-surface-raised",
                interactiveBase,
                focusRing
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

