import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog | MarkdownTown",
  description: "Release notes and history for MarkdownTown.",
};

async function loadChangelogExcerpt() {
  try {
    const file = await fs.readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
    // Show the top of the changelog so users see the latest release right away.
    return file.split("\n").slice(0, 60).join("\n").trim();
  } catch (err) {
    console.warn("changelog: unable to read file", err);
    return null;
  }
}

export default async function ChangelogPage() {
  const excerpt = await loadChangelogExcerpt();

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-caption text-mdt-muted">Changelog</p>
        <h1 className="text-display">What\u2019s new in MarkdownTown</h1>
        <p className="text-body text-mdt-muted">
          Recent releases and fixes. View the complete history on GitHub.
        </p>
        <Link
          href="https://github.com/joelklabo/markdowntown/blob/main/CHANGELOG.md"
          className="text-mdt-blue hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Open full changelog on GitHub
        </Link>
      </div>

      <Card className="space-y-3 p-5">
        <h2 className="text-h3">Latest entries</h2>
        {excerpt ? (
          <pre className="whitespace-pre-wrap font-mono text-sm text-mdt-text">{excerpt}</pre>
        ) : (
          <p className="text-sm text-mdt-muted">
            Couldn\u2019t load the changelog from the repository. Check the GitHub link above for the latest notes.
          </p>
        )}
      </Card>
    </main>
  );
}
