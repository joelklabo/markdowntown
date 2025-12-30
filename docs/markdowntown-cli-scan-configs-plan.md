# markdowntown scan-configs (v1) plan

## Goal
Ship a first, tightly scoped CLI command that inventories AI coding tool configuration and instruction files across repo, user, and (optional) global scopes, producing deterministic JSON suitable for any UI.

## Scope (v1)
- Data in: filesystem only (repo + optional user/global roots).
- Data out: a single JSON object (optionally JSONL later).
- No content parsing beyond lightweight metadata (size/hash/mtime).
- No UI work.

## Research-backed discovery patterns (confirmed)

### Repo-scoped instructions and prompts
- GitHub Copilot custom instructions file: `.github/copilot-instructions.md`. Requires Copilot settings to apply, but still a discoverable artifact.
- GitHub Copilot instructions directory: `.github/instructions/*.instructions.md` with optional `applyTo` frontmatter.
- GitHub Copilot prompt files: `.github/prompts/*.prompt.md` (enabled via IDE settings such as `chat.promptFiles`).
- GitHub Copilot coding agent also recognizes repo-root instruction files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.

Sources:
- https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot
- https://docs.github.com/en/copilot/customizing-copilot/using-prompt-files
- https://github.blog/changelog/2024-10-29-github-copilot-in-vs-code-github-copilot-extensions-are-now-in-public-preview-and-more/

### OpenAI Codex (AGENTS)
- `AGENTS.md` files apply hierarchically; nearest ancestor applies for a file.
- Global instructions via `~/.codex/instructions.md` or `$CODEX_HOME/instructions.md`.

Source:
- https://platform.openai.com/docs/codex/advanced#project-documents

### Gemini CLI
- Context file: `GEMINI.md` can be placed in directories; CLI loads nearest ancestor.
- Global context: `~/.gemini/GEMINI.md`.
- Ignore file: `.geminiignore`.
- Settings: `~/.gemini/settings.json`.

Source:
- https://github.com/google-gemini/gemini-cli/blob/main/docs/cli.md

### VS Code instructions files
- VS Code supports `.instructions.md` files with `applyTo` frontmatter.
- Instructions discovery locations are configurable (`chat.instructionsFilesLocations`).

Source:
- https://code.visualstudio.com/docs/copilot/copilot-customization

### Cursor
- Cursor rules live in `.cursor/rules` and legacy `.cursorrules`.

Source:
- https://docs.cursor.com/context/rules (documented in Cursor rules docs)

### Cline
- Project rules: `.clinerules/` or `.clinerules` in the repo root.
- Global user rules: `~/Documents/Cline/Rules/`.

Source:
- https://docs.cline.bot/prompting/clinerules

### Aider
- Aider configuration: `.aider.conf.yml` (and optional `.aider.conf` / `.aider.conf.toml`).

Source:
- https://aider.chat/docs/config.html

### Continue
- Continue config files include `~/.continue/config.yaml`, `config.json`, or `config.ts`.

Source:
- https://docs.continue.dev/configuration/configuration-file

### Zed compatibility (useful for cross-tool discovery)
Zed documents a compatibility list that includes `.cursorrules`, `.windsurfrules`, `.clinerules`, `.aider.conf`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`.

Source:
- https://zed.dev/docs/ai/rules

## Proposed pattern registry (make easy to update)
Create a dedicated registry file (checked in) so patterns can be updated without touching code:

`data/ai-config-patterns.json`
```json
{
  "version": "1.0",
  "sources": [
    {
      "id": "github-copilot-instructions",
      "tool": "github-copilot",
      "kind": "instructions",
      "scope": "repo",
      "paths": [".github/copilot-instructions.md"],
      "notes": "Requires VS Code setting to apply",
      "priority": 80,
      "docs": ["https://docs.github.com/..."],
      "status": "confirmed"
    }
  ]
}
```

Registry goals:
- Single source of truth for file patterns.
- Include `docs` (URLs) and `status` (`confirmed` vs `community`) to track certainty.
- Versioned to ease breaking changes.
- Can be surfaced in UI later.

## Scanning plan (v1)
1. Resolve repo root (git root if available; else `--repo` or cwd).
2. Build scan roots:
   - repo root (always)
   - user roots (optional): `~/.codex`, `~/.config`, `~/.config/Code/User`, `~/.gemini`, `~/Documents/Cline/Rules`, `~/.continue`
   - global roots (optional): `/etc` or OS-specific config roots (TBD)
3. Load pattern registry, expand glob patterns per root.
4. Collect matches with metadata: `path`, `scope`, `tool`, `kind`, `priority`, `sizeBytes`, `sha256`, `mtime`.
5. Produce deterministic output (sort by scope > tool > path).

## Output schema (v1)
```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2025-12-30T00:00:00Z",
  "toolVersion": "0.1.0",
  "repoRoot": "/path/to/repo",
  "scans": [
    {"scope": "repo", "root": "/path/to/repo"},
    {"scope": "user", "root": "/Users/me/.gemini"}
  ],
  "configs": [
    {
      "path": ".github/copilot-instructions.md",
      "scope": "repo",
      "tool": "github-copilot",
      "kind": "instructions",
      "priority": 80,
      "sizeBytes": 1240,
      "sha256": "..."
    }
  ]
}
```

## Known gaps / risks (to resolve next)
- Windsurf: Zed lists `.windsurfrules`, but official Windsurf docs need confirmation.
- Claude Code: `CLAUDE.md` and `.claude/settings.json` are referenced in Anthropic docs; verify exact precedence rules and global/local locations.
- VS Code instruction file locations can be configured; consider reading `settings.json` to discover custom paths.
- Multi-root workspaces: should report repo roots per workspace.

## Acceptance criteria for v1
- A single command `markdowntown scan-configs` produces deterministic JSON for all confirmed patterns.
- Pattern registry is a standalone file with versioning + docs links.
- Tests cover pattern expansion and ordering with fixtures.
- Plan documents gaps for Windsurf/Claude precedence.
