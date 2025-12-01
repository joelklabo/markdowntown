# Auth Gating UX & API Guardrails
Date: 2025-12-01
Epic: markdowntown-7z8

## Principles
- Browsing, search, copy/download/export are open to anonymous users.
- Creating/editing, saving documents, favorites/pins, votes, and comments require auth.
- Don’t block the flow: inline prompts preserve context and resume the action after login.

## UX patterns
- **Inline toast/modal** when user clicks a gated action: “Sign in to favorite/save/comment. We’ll bring you back here.” Include primary CTA “Sign in” and secondary “Continue browsing”.
- **Optimistic resume**: encode pending action in `callbackUrl` (e.g., `callbackUrl=/snippets/slug?action=favorite`). After login, replay the action client-side.
- **Button states**: show lock icon + tooltip for gated actions; keep primary CTA enabled to trigger sign-in, not hidden.
- **Builder**: allow assemble/copy/download anonymous; “Save as Document” triggers sign-in flow.

## API guardrails
- Write endpoints (create/update/delete/vote/favorite/comment/save document) require session.
- Rate limit by IP + user (existing limiter) with tuned buckets for engagement endpoints (e.g., votes/comments).
- Validate visibility: cannot favorite/vote/comment on private items unless owner.
- Sanitization: comments/markdown run through existing validation; strip disallowed HTML.

## Pending actions to implement
- Frontend wrappers for gated actions (higher-order button component) that opens sign-in modal and stores intent.
- Server: engagement endpoints with auth + rate limit + visibility checks.
- Resume logic post-login (read `action` query, perform API call, then toast result).
- Telemetry: track `gated_shown`, `gated_accept`, `gated_dismiss`, and conversion to signup.

