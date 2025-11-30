# UX QA checklist (responsive & cross-browser)

Run against production (https://markdown.town) and staging if available.

## Browsers
- Chrome (latest), Safari (latest macOS), Firefox (latest)

## Viewports
- Mobile: 375x812
- Tablet: 768x1024
- Desktop: 1440x900

## Checks
- Header: logo + buttons align; buttons visible at all sizes.
- Hero: headings wrap gracefully, buttons don’t stack awkwardly.
- Composer (logged in): panels stack on mobile; scroll within left panel works; textarea usable on mobile.
- Buttons: hover/active/focus ring visible; disabled state applied (e.g., when saving).
- Typography: pill text readable; no overflow on narrow widths.
- Forms: delete confirm appears; inputs/textarea padding consistent.
- Images/icons: logo renders crisp; no broken avatars.
- Performance: page loads under 2s on desktop; no layout shifts after load.

## Notes
Record any visual issues with screenshot + browser + viewport.
