import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] px-4 py-8 text-sm text-mdt-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-mdt-text font-semibold">MarkdownTown</p>
          <p className="max-w-xl text-mdt-muted">Compose, remix, and preview reusable markdown sections for your AI agents.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4" aria-label="Footer">
          <Link className="hover:text-mdt-text" href="/docs">Docs</Link>
          <Link className="hover:text-mdt-text" href="/changelog">Changelog</Link>
          <Link className="hover:text-mdt-text" href="/privacy">Privacy</Link>
          <Link className="hover:text-mdt-text" href="/terms">Terms</Link>
          <a className="hover:text-mdt-text" href="https://github.com/joelklabo/markdowntown" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
