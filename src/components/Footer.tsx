import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-mdt-border bg-white px-4 py-6 text-sm text-mdt-muted dark:border-mdt-border-dark dark:bg-mdt-bg-soft-dark dark:text-mdt-muted-dark">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <span>MarkdownTown</span>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="hover:text-mdt-text dark:hover:text-mdt-text-dark" href="/docs">Docs</Link>
          <Link className="hover:text-mdt-text dark:hover:text-mdt-text-dark" href="/changelog">Changelog</Link>
          <Link className="hover:text-mdt-text dark:hover:text-mdt-text-dark" href="/privacy">Privacy</Link>
          <Link className="hover:text-mdt-text dark:hover:text-mdt-text-dark" href="/terms">Terms</Link>
          <a className="hover:text-mdt-text dark:hover:text-mdt-text-dark" href="https://github.com/joelklabo/markdowntown" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
