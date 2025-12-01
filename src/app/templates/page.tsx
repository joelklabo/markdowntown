import { sampleItems } from "@/lib/sampleContent";
import { LibraryCard } from "@/components/LibraryCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates | MarkdownTown",
  description: "Templates with placeholders you can fill and export to agents.md.",
};

export default function TemplatesPage() {
  const templates = sampleItems.filter((i) => i.type === "template");
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-caption text-mdt-muted">Templates</p>
          <h1 className="text-display">Fill-in-the-blank agents.md templates</h1>
          <p className="text-body text-mdt-muted max-w-2xl">
            Start faster with structured templates. Fill placeholders, preview, then export or add to your builder stack.
          </p>
        </div>
        <Button asChild>
          <Link href="/builder">Open builder</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
