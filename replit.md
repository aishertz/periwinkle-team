# Periwinkle

A team dashboard for the Periwinkle Minecraft SMP group on Kabanata Dos SMP — includes member roster, lore, gallery, trade requests, and rules.

## Run & Operate

- **Start:** `node server.js` (or `npm start`)
- **Port:** 5000 (mapped to external port 80)
- **Env vars:** `OWNER_PASSWORD` (default: winkleperi123), `SESSION_SECRET` (any random string)

## Stack

- **Runtime:** Node.js 20
- **Backend:** Express 4 + express-session
- **Frontend:** Vanilla JS, HTML5, CSS3 (multipage, no build step)
- **Database:** Flat-file JSON (`database.json`)

## Where things live

- `server.js` — Express server with all API routes
- `database.json` — Trade requests storage (auto-created if missing)
- `js/script.js` — Client-side JS: session display, login forms, trade request board
- `css/style.css` — All styles; uses `.viewer-mode`/`.owner-mode`/`.guest-mode` body classes
- `images/` — Character portraits, logos, build screenshots
- HTML pages: `index.html`, `access.html`, `trades.html`, `members.html`, `lore.html`, `gallery.html`, `rules.html`

## Architecture decisions

- Session-based auth with two roles: **viewer** (Minecraft IGN + Discord) and **owner** (shared team account)
- CSS body-class approach for role visibility: JS adds `viewer-mode`/`owner-mode`/`guest-mode` to `<body>`, CSS `.viewer-only` and `.owner-only` rules handle show/hide
- Flat-file JSON database — simple, no external DB needed for this use case
- All pages are static HTML served by Express; dynamic content loaded via fetch to `/api/*` endpoints

## Product

- Home page with hero and portal grid linking all sections
- Members roster with character portraits, roles, and base locations
- Lore page with team backstory
- Gallery of build screenshots
- Trade request board: viewers submit requests, owners accept/decline/complete/delete them
- Access page for viewer and owner login
- Rules page with team guidelines

## User preferences

_Populate as you build_

## Gotchas

- `js/script.js` is the **client-side** script — do not confuse with `server.js`
- The CSS uses body classes for role-gating, not inline styles — always set `document.body.classList` from JS
- Delete on trade requests has no confirmation dialog (removed for browser automation compatibility)

## Pointers

- [Express docs](https://expressjs.com/)
- [express-session](https://www.npmjs.com/package/express-session)
