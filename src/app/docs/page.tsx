import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs | MarkdownTown",
  description: "Documentation and guides for MarkdownTown, agents.md workflows, and agents plugins.",
};

const docsLinks = [
  { label: "AGENTS.md", href: "https://github.com/steveyegge/markdowntown/blob/main/AGENTS.md" },
  { label: "README", href: "https://github.com/steveyegge/markdowntown/blob/main/README.md" },
  { label: "Developer onboarding", href: "https://github.com/steveyegge/markdowntown/blob/main/docs/DEV_ONBOARDING.md" },
  { label: "Beads CLI", href: "https://github.com/steveyegge/markdowntown/blob/main/docs/BEADS.md" },
];

export default function DocsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-caption text-mdt-muted">Docs</p>
        <h1 className="text-display">MarkdownTown documentation</h1>
        <p className="text-body text-mdt-muted">
          Quick links to the guides already in this repo. More to come as the public library ships.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {docsLinks.map((link) => (
          <Card key={link.href} className="flex items-center justify-between">
            <div>
              <h3 className="text-h3">{link.label}</h3>
              <p className="text-body-sm text-mdt-muted">View {link.label}</p>
            </div>
            <Link href={link.href} className="text-mdt-blue hover:underline">
              Open
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
