# Codex skills overview

## Available skills
- **markdowntown-bd** — bd workflow, git hygiene, test loop.
- **markdowntown-frontend** — UI, layout, design system constraints.
- **markdowntown-atlas-scan** — scan + simulator flow and handoff.
- **markdowntown-workbench** — Workbench state, export/compile pipeline.
- **markdowntown-testing** — test commands, E2E + Playwright guidance.
- **markdowntown-docs** — docs locations, terminology, content style.
- **markdowntown-analytics** — event tracking, privacy, redaction rules.

## Source locations
- Skill sources live in `codex/skills/<skill-name>/`.
- Installed skills sync to `~/.codex/skills/<skill-name>/`.

## Maintenance workflow
1. Update `codex/skills/<skill>/SKILL.md` or references.
2. Validate: `node scripts/codex/validate-skills.mjs`.
3. Sync: `scripts/codex/sync-skills.sh --verbose`.
4. Re-run Codex CLI if needed to reload skills.
