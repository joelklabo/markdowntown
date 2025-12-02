import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Privacy | MarkdownTown",
  description: "Learn how MarkdownTown handles data in this preview environment.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-caption text-mdt-muted">Privacy</p>
        <h1 className="text-display">How we handle your data</h1>
        <p className="text-body text-mdt-muted">
          MarkdownTown is running in a local/demo environment. We store minimal data and you can remove it anytime.
        </p>
      </div>

      <Card className="space-y-2 p-5">
        <h2 className="text-h3">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-mdt-muted">
          <li>Authentication data only when you sign in via GitHub.</li>
          <li>Content you choose to save (snippets, templates, or documents).</li>
          <li>Basic usage telemetry when enabled (anonymized for local dev).</li>
        </ul>
      </Card>

      <Card className="space-y-2 p-5">
        <h2 className="text-h3">Your choices</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-mdt-muted">
          <li>Use the app without signing in to browse and copy content.</li>
          <li>Delete saved documents from the Documents area when signed in.</li>
          <li>Opt out of telemetry by leaving analytics env vars unset.</li>
        </ul>
        <p className="text-sm text-mdt-muted">
          Questions? Reach out via the project GitHub issues:
          {" "}
          <Link href="https://github.com/joelklabo/markdowntown/issues" className="text-mdt-blue hover:underline" target="_blank" rel="noreferrer">
            github.com/joelklabo/markdowntown
          </Link>
        </p>
      </Card>
    </main>
  );
}
