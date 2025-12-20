import Link from "next/link";
import { Container } from "./ui/Container";
import { Text } from "./ui/Text";

export function Footer() {
  return (
    <footer className="mt-mdt-16 border-t border-mdt-border/70 bg-[color:var(--mdt-color-surface-subtle)]/95 py-mdt-12 text-body-sm text-mdt-muted">
      <Container as="div" padding="md" className="grid gap-mdt-8 md:grid-cols-[minmax(0,1.2fr),minmax(0,2fr)]">
        <div className="space-y-mdt-2">
          <Text as="p" weight="semibold" tone="default">
            mark downtown
          </Text>
          <Text as="p" tone="muted" className="max-w-xl">
            Compose, remix, and preview reusable markdown sections for your AI agents.
          </Text>
          <Text as="p" size="caption" tone="muted">
            Built for clear, consistent instruction workflows.
          </Text>
        </div>
        <nav className="grid gap-mdt-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Footer">
          <div className="space-y-mdt-2">
            <Text as="p" size="caption" weight="semibold" tone="muted" className="uppercase tracking-[0.24em]">
              Product
            </Text>
            <div className="flex flex-col gap-mdt-2 text-body-sm text-mdt-text">
              <Link className="hover:text-mdt-text" href="/library">
                Library
              </Link>
              <Link className="hover:text-mdt-text" href="/workbench">
                Workbench
              </Link>
              <Link className="hover:text-mdt-text" href="/translate">
                Translate
              </Link>
              <Link className="hover:text-mdt-text" href="/atlas">
                Atlas
              </Link>
            </div>
          </div>
          <div className="space-y-mdt-2">
            <Text as="p" size="caption" weight="semibold" tone="muted" className="uppercase tracking-[0.24em]">
              Resources
            </Text>
            <div className="flex flex-col gap-mdt-2 text-body-sm text-mdt-text">
              <Link className="hover:text-mdt-text" href="/docs">
                Docs
              </Link>
              <Link className="hover:text-mdt-text" href="/changelog">
                Changelog
              </Link>
              <a className="hover:text-mdt-text" href="https://github.com/joelklabo/markdowntown" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
          <div className="space-y-mdt-2">
            <Text as="p" size="caption" weight="semibold" tone="muted" className="uppercase tracking-[0.24em]">
              Legal
            </Text>
            <div className="flex flex-col gap-mdt-2 text-body-sm text-mdt-text">
              <Link className="hover:text-mdt-text" href="/privacy">
                Privacy
              </Link>
              <Link className="hover:text-mdt-text" href="/terms">
                Terms
              </Link>
            </div>
          </div>
        </nav>
        <div className="md:col-span-2 border-t border-mdt-border/60 pt-mdt-4 text-caption text-mdt-muted">
          © 2025 mark downtown. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
