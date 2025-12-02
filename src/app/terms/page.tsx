import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Terms | MarkdownTown",
  description: "Terms of use for the MarkdownTown demo environment.",
};

export default function TermsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-caption text-mdt-muted">Terms</p>
          <h1 className="text-display">MarkdownTown terms of use</h1>
          <p className="text-body text-mdt-muted">
            These lightweight terms cover using the local/demo version of MarkdownTown.
          </p>
        </div>

        <Card className="space-y-2 p-5">
          <h2 className="text-h3">Acceptable use</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-mdt-muted">
            <li>Use the app for composing, copying, or testing markdown content.</li>
            <li>Avoid uploading sensitive or production data in this demo environment.</li>
            <li>Respect third-party licenses when importing or sharing content.</li>
          </ul>
        </Card>

        <Card className="space-y-2 p-5">
          <h2 className="text-h3">Liability & availability</h2>
          <p className="text-sm text-mdt-muted">
            This preview is provided &quot;as is&quot; with no uptime guarantees. Content may be cleared during development cycles.
          </p>
          <p className="text-sm text-mdt-muted">
            Report issues or questions on GitHub:
            {" "}
            <Link href="https://github.com/joelklabo/markdowntown/issues" className="text-mdt-blue hover:underline" target="_blank" rel="noreferrer">
              github.com/joelklabo/markdowntown
            </Link>
            .
          </p>
        </Card>
    </main>
  );
}
