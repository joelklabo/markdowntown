# markdowntown scan — v1 Specification

## Overview

**Command**: `markdowntown scan`

A CLI tool that inventories AI coding tool configuration and instruction files across repo and user scopes, producing deterministic JSON output suitable for programmatic consumption.

**Implementation**: Go with parallel I/O
**First feature**: This is a greenfield project; spec includes scaffolding.

---

## CLI Interface

### Usage

```bash
markdowntown scan [flags]
```

### Flags

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--repo` | path | (auto) | Explicit repo root. Required if not in a git repo. |
| `--repo-only` | bool | false | Exclude user scope; scan repo only. |
| `-q`, `--quiet` | bool | false | Suppress progress output; JSON only to stdout. |
| `--include-content` | bool | false | Include file contents in output. |
| `--version` | bool | - | Output `markdowntown X.Y.Z (schema A.B)` |

### Exit Codes

| Code | Meaning |
| --- | --- |
| 0 | Success (even with warnings) |
| 1 | Fatal error |

### Progress Output

When not in quiet mode, display spinner with counts to stderr:

```text
Scanning... found 12 configs
```

---

## Scanning Behavior

### Repo Root Detection

- **Require git root**: Find git root from cwd. Error if not in a git repo.
- `--repo <path>` overrides detection.

### Scope Defaults

- **Default**: repo + user scopes
- `--repo-only`: excludes user scope

### User-Scope Roots

Checked with `exists: bool` in output:

- `~/.codex`
- `~/.config/Code/User`
- `~/.gemini`
- `~/Documents/Cline/Rules`
- `~/.continue`
- `~/.cursor`

### Submodules

- **Skip submodules** by default (stop at submodule boundaries)

### Symlinks

- **Follow symlinks** and report the resolved target path
- Include external targets (symlinks pointing outside scan roots)

### Directory Configs

- **Enumerate individual files** within config directories (e.g., `.cursor/rules/*`)
- No depth or file count limits

### Gitignore

- Report all matching files regardless of .gitignore status
- Include `gitignored: bool` field for each config entry

### Parallelism

- Use parallel I/O for file discovery and metadata collection

---

## Pattern Registry

### Location

External file: `data/ai-config-patterns.json`

### Format

Strict JSON (no comments). Use `notes` field for documentation.

### Schema

```json
{
  "version": "1.0",
  "patterns": [
    {
      "id": "github-copilot-instructions",
      "toolId": "github-copilot",
      "toolName": "GitHub Copilot",
      "kind": "instructions",
      "scope": "repo",
      "paths": [".github/copilot-instructions.md"],
      "type": "glob",
      "notes": "Requires VS Code setting to apply",
      "hints": [
        {
          "type": "requires-setting",
          "setting": "github.copilot.chat.codeGeneration.useInstructionFiles"
        }
      ],
      "docs": [
        "https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot"
      ]
    }
  ]
}
```

### Pattern Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Unique identifier for this pattern |
| `toolId` | string | yes | Normalized tool ID (lowercase, hyphenated) |
| `toolName` | string | yes | Human-readable tool name |
| `kind` | enum | yes | One of: `instructions`, `config`, `prompts`, `rules`, `skills`, `agent` |
| `scope` | enum | yes | One of: `repo`, `user`, `global` |
| `paths` | string[] | yes | Glob or regex patterns |
| `type` | enum | no | `glob` (default) or `regex` |
| `notes` | string | no | Human-readable activation hints |
| `hints` | object[] | no | Structured activation hints |
| `docs` | string[] | yes | Official documentation URLs |

### Pattern Matching

- **Default type**: glob (shell-style: `*`, `**`, `?`)
- **Regex**: when `type: "regex"` specified, full regex syntax
- **Case-insensitive** matching by default
- **Path expansion**: `~` expands to home directory

### Rigor

Only add patterns with official documentation. No `status` field; if we can't cite official docs, don't add it.

### Validation

- **Fail fast** if registry contains malformed patterns (bad regex)

---

## Output Schema

### Top-Level Structure

```json
{
  "schemaVersion": "1.0",
  "registryVersion": "1.0",
  "toolVersion": "0.1.0",
  "scanStartedAt": 1735561234567,
  "generatedAt": 1735561235123,
  "repoRoot": "/path/to/repo",
  "scans": [],
  "configs": [],
  "warnings": []
}
```

### Timestamps

All timestamps are **Unix epoch milliseconds** (integers).

### Scans Array

Lists all roots that were checked, with existence status:

```json
{
  "scans": [
    { "scope": "repo", "root": "/path/to/repo", "exists": true },
    { "scope": "user", "root": "/Users/me/.gemini", "exists": true },
    { "scope": "user", "root": "/Users/me/.codex", "exists": false }
  ]
}
```

### Config Entry

```json
{
  "path": "/path/to/repo/.github/copilot-instructions.md",
  "scope": "repo",
  "depth": 0,
  "sizeBytes": 1240,
  "sha256": "a1b2c3...",
  "mtime": 1735500000000,
  "gitignored": false,
  "tools": [
    {
      "toolId": "github-copilot",
      "toolName": "GitHub Copilot",
      "kind": "instructions",
      "notes": "Requires VS Code setting to apply",
      "hints": [
        {
          "type": "requires-setting",
          "setting": "github.copilot.chat.codeGeneration.useInstructionFiles"
        }
      ]
    }
  ]
}
```

### Config Fields

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `path` | string | no | Absolute path (OS-native separators) |
| `scope` | enum | no | `repo`, `user`, or `global` |
| `depth` | int | no | Distance from scan root (0 = at root) |
| `sizeBytes` | int | yes | Null if read error |
| `sha256` | string | yes | Null if read error |
| `mtime` | int | no | Last modified time (epoch ms) |
| `gitignored` | bool | no | Whether file matches .gitignore |
| `content` | string | yes | File contents (only with `--include-content`) |
| `contentSkipped` | string | yes | Reason content was skipped (e.g., `"binary"`) |
| `error` | string | yes | Error code if read failed (e.g., `"EACCES"`) |
| `warning` | string | yes | Warning if issue detected (e.g., `"empty"`) |
| `tools` | object[] | no | Tools that recognize this config |

### Tool Entry (within config)

| Field | Type | Description |
| --- | --- | --- |
| `toolId` | string | Normalized ID (e.g., `github-copilot`) |
| `toolName` | string | Display name (e.g., `GitHub Copilot`) |
| `kind` | enum | `instructions`, `config`, `prompts`, `rules`, `skills`, `agent` |
| `notes` | string | Human-readable activation hint |
| `hints` | object[] | Structured activation hints |

### Warnings Array

```json
{
  "warnings": [
    { "path": "/path/to/file", "code": "EACCES", "message": "Permission denied" }
  ]
}
```

### Multi-Tool Files

Files like `CLAUDE.md` that are recognized by multiple tools get a **single config entry** with multiple items in the `tools` array. Deduplication is by resolved absolute path.

### Sorting Order

Configs are sorted deterministically: **scope → depth → path**

1. By scope: `repo` < `user` < `global`
2. Within scope: by depth (0 = closest to root)
3. Within depth: alphabetical by path

---

## Content Handling

### --include-content Flag

When specified, include file contents in the `content` field.

### Binary Files

- Detect binary content
- Set `content: null` with `contentSkipped: "binary"`

### No Size Limit

Include full content regardless of file size.

### Hashing

- **Always compute SHA256** regardless of file size
- Hash raw bytes (no encoding normalization)
- Config files should be small; large files are user's responsibility

### Empty Files

- Include in output with `warning: "empty"`

---

## Error Handling

### Unreadable Files

Include the config entry with:

- `sizeBytes: null`
- `sha256: null`
- `error: "EACCES"` (or relevant error code)

### Bad Registry Patterns

**Fail fast** on registry load if patterns are malformed.

---

## Research-Backed Discovery Patterns

### Repo-Scoped: GitHub Copilot

| Pattern | Kind | Notes |
| --- | --- | --- |
| `.github/copilot-instructions.md` | instructions | Requires VS Code setting |
| `.github/instructions/*.instructions.md` | instructions | Optional `applyTo` frontmatter |
| `.github/prompts/*.prompt.md` | prompts | Enabled via `chat.promptFiles` |

Docs: <https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot>

### Repo-Scoped: Multi-Tool Root Files

| Pattern | Tools | Kind |
| --- | --- | --- |
| `AGENTS.md` | codex, copilot | instructions |
| `CLAUDE.md` | claude-code, copilot | instructions |
| `GEMINI.md` | gemini-cli, copilot | instructions |

### OpenAI Codex

| Scope | Pattern | Kind |
| --- | --- | --- |
| repo | `AGENTS.md` (hierarchical, nearest ancestor) | instructions |
| user | `~/.codex/instructions.md` | instructions |

Docs: <https://platform.openai.com/docs/codex/advanced#project-documents>

### Gemini CLI

| Scope | Pattern | Kind |
| --- | --- | --- |
| repo | `GEMINI.md` (hierarchical, nearest ancestor) | instructions |
| user | `~/.gemini/GEMINI.md` | instructions |
| user | `~/.gemini/settings.json` | config |
| repo | `.geminiignore` | config |

Docs: <https://github.com/google-gemini/gemini-cli/blob/main/docs/cli.md>

### Cursor

| Scope | Pattern | Kind |
| --- | --- | --- |
| repo | `.cursor/rules/**/*` | rules |
| repo | `.cursorrules` | rules (legacy) |

Docs: <https://docs.cursor.com/context/rules>

### Cline

| Scope | Pattern | Kind |
| --- | --- | --- |
| repo | `.clinerules/**/*` | rules |
| repo | `.clinerules` (file) | rules |
| user | `~/Documents/Cline/Rules/**/*` | rules |

Docs: <https://docs.cline.bot/prompting/clinerules>

### Aider

| Scope | Pattern | Kind |
| --- | --- | --- |
| repo | `.aider.conf.yml` | config |
| repo | `.aider.conf` | config |
| repo | `.aider.conf.toml` | config |

Docs: <https://aider.chat/docs/config.html>

### Continue

| Scope | Pattern | Kind |
| --- | --- | --- |
| user | `~/.continue/config.yaml` | config |
| user | `~/.continue/config.json` | config |
| user | `~/.continue/config.ts` | config |

Docs: <https://docs.continue.dev/configuration/configuration-file>

### Claude Code

| Scope | Pattern | Kind |
| --- | --- | --- |
| repo | `CLAUDE.md` (hierarchical) | instructions |
| repo | `.claude/settings.json` | config |
| user | `~/.claude/CLAUDE.md` | instructions |
| user | `~/.claude/settings.json` | config |

### Windsurf

| Scope | Pattern | Kind |
| --- | --- | --- |
| repo | `.windsurfrules` | rules |

Note: Listed in Zed compatibility; needs official Windsurf docs verification.

---

## Project Structure (Greenfield)

```text
markdowntown/
├── cmd/
│   └── markdowntown/
│       └── main.go
├── internal/
│   ├── scan/
│   │   ├── scanner.go      # Core scanning logic
│   │   ├── registry.go     # Pattern registry loading
│   │   ├── matcher.go      # Glob/regex matching
│   │   └── output.go       # JSON output formatting
│   ├── git/
│   │   └── root.go         # Git root detection
│   └── hash/
│       └── sha256.go       # File hashing
├── data/
│   └── ai-config-patterns.json
├── testdata/
│   └── repos/              # Real-world sample repos for testing
├── go.mod
├── go.sum
└── README.md
```

---

## Testing Strategy

### Fixtures

Use **real samples** from open-source repos (sanitized). Structure tests to support future remote URL scanning.

### Test Cases

1. Pattern expansion (glob and regex)
2. Multi-tool file deduplication
3. Symlink resolution (including external targets)
4. Error handling (permission denied, missing files)
5. Empty file detection
6. Sorting determinism
7. User-scope root existence detection

---

## Future Considerations (Out of v1 Scope)

### Separate Command: Remote Scanning

`markdowntown scan-remote <git-url>` — Clone to temp dir, scan, clean up.

### Effective Config Computation

Add `--for-file <path>` flag to filter output to configs that would apply to a specific file, using depth/precedence logic.

### VS Code Custom Paths

Consider reading `settings.json` to discover custom `chat.instructionsFilesLocations`.

### Multi-Root Workspaces

Support for VS Code-style `.code-workspace` files with multiple roots.

### JSONL Output

May be useful for `--watch` mode or streaming large results.

---

## Acceptance Criteria

- [ ] `markdowntown scan` produces deterministic JSON for all documented patterns
- [ ] Pattern registry is external JSON with versioning and docs links
- [ ] Scans array shows all checked roots with existence status
- [ ] Multi-tool files have single entry with tools array
- [ ] Progress spinner shows counts in non-quiet mode
- [ ] `--include-content` works with binary file detection
- [ ] Exit 1 on fatal error (bad registry, not in git repo without --repo)
- [ ] Tests use real-world repo samples
- [ ] `--version` outputs `markdowntown X.Y.Z (schema A.B)`
