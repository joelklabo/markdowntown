import Link from "next/link";
import { Container } from "./ui/Container";
import { Text } from "./ui/Text";

export function Footer() {
  return (
    <footer className="mt-mdt-16 border-t border-mdt-border bg-[color:var(--mdt-color-surface-subtle)] py-mdt-8 text-body-sm text-mdt-muted">
      <Container as="div" padding="sm" className="flex flex-col gap-mdt-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-mdt-1">
          <Text as="p" weight="semibold" tone="default">
            MarkdownTown
          </Text>
          <Text as="p" tone="muted" className="max-w-xl">
            Compose, remix, and preview reusable markdown sections for your AI agents.
          </Text>
        </div>
        <nav className="flex flex-wrap items-center gap-mdt-4" aria-label="Footer">
          <Link className="hover:text-mdt-text" href="/docs">
            Docs
          </Link>
          <Link className="hover:text-mdt-text" href="/changelog">
            Changelog
          </Link>
          <Link className="hover:text-mdt-text" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-mdt-text" href="/terms">
            Terms
          </Link>
          <a className="hover:text-mdt-text" href="https://github.com/joelklabo/markdowntown" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </Container>
    </footer>
  );
}
