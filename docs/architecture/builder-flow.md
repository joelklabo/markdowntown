# Builder Flow (Public + Auth Save)
Date: 2025-12-01
Epic: markdowntown-7z8

## UX stages
1) Choose template (or start blank).
2) Add snippets (search/filter/library/favorites if authed).
3) Arrange (drag), local overrides per snippet.
4) Preview (rendered + raw agents.md), warnings for non-public snippets.
5) Export: Copy/Download for anon; Save as Document for authed.

## Data contract for builder API
POST /api/builder/render
- body: { templateId?: string, snippetIds: string[], overrides?: { snippetId: string; content?: string }[] }
- returns: { markdown: string, title: string, stats: { snippetCount, usesTemplate }, warnings?: string[] }

POST /api/documents (auth)
- Create Document with slug/title/visibility/tags, renderedContent snapshot, and DocumentSnippet rows with order + overrides.

## Edge cases
- Mixing private snippets: warn and block export? For anon, omit; for authed owner, allow but mark visibility.
- Template placeholders: must validate required fields; fallback defaults.
- Ordering: maintain stable order; if user adds same snippet twice, allow with separate positions.

## Needed components
- Search/add panel with filters + keyboard shortcut.
- Drag list with inline edit/override.
- Preview pane with copy/download buttons.
- Sign-in prompt on Save action.

## TODO implementation
- Server render endpoint (can be pure function initially) using markdown concat + template substitution.
- Client state: builder store with template, snippets[], overrides, preview markdown.
- Export/download handler (blob download).
- Analytics events: add_to_builder, builder_export, save_document.

