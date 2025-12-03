# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Redesign 2025: dual-theme token system, rebuilt primitives, Storybook playground.
- Landing overhaul with guided “build in 60s” path and calmer hero.
- Browse faceted filters, quality strip, empty state, and inline metrics.
- Snippet/Template detail quality signals + updated actions.
- Builder 3-pane polish: status strip, autosave feedback, tokenized focus.
- Motion presets + reduced-motion guardrails.
- Data viz mini-kit (sparkline, mini bars, donut) and content design system.
- Visual regression baselines for / and /browse; a11y/perf budgets documented.
- Onboarding/playful plan (checklist, sample loader, celebratory states).

## [0.1.0] - 2025-11-30
### Added
- Initial MarkdownTown app with Next.js 16 App Router, Tailwind design system, and Section composer UI (list/edit/preview, live markdown render).
- GitHub OAuth via NextAuth with Prisma adapter, sessions stored in Postgres.
- Sections CRUD API routes secured by session auth.
- Azure Container Apps deployment (West US 3) with Cloudflare DNS + certs for markdown.town / www.
- CI (lint/type-check/test) and CD workflow definitions; service principal + secrets in GitHub Actions.
- Design system tokens, components (BrandLogo, Button, Card, Pill), and example page.
- Health endpoint `/api/health`.
- Vitest + Testing Library setup with validation and CRUD tests.
- Developer onboarding guide.

[Unreleased]: https://github.com/joelklabo/markdowntown/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/joelklabo/markdowntown/releases/tag/v0.1.0
