# Periwinkle Trades

A guild/trading website for managing trade requests, member info, gallery, and lore pages.

## Run & Operate

- **Run:** `node server.js`
- **Required env vars:**
  - `OWNER_PASSWORD` — login password for owner account (default: `winkleperi123`)
  - `SESSION_SECRET` — secret for express-session (default: `periwinkle-secret`)

## Stack

- Node.js 20 + Express 4
- express-session for auth
- Flat JSON file (`database.json`) as data store
- Static HTML/CSS/JS frontend

## Where things live

- `server.js` — Express server, all API routes
- `database.json` — persistent trade request storage
- `*.html` — static pages (index, gallery, lore, members, trades, rules, access)
- `css/` — stylesheets
- `js/` — client-side scripts
- `images/` — image assets

## Architecture decisions

- Single-server app: Express serves both static files and API routes on port 5000
- Session-based auth with two roles: `owner` (full control) and `viewer` (submit requests)
- JSON file used as a simple database (no external DB dependency)
- Deployment target: autoscale

## Product

- Members can log in as viewer (IGN + Discord) to submit trade requests
- Owner (`ptuser`) can accept, decline, mark done, or delete requests
- Static pages for gallery, lore, rules, and member info

## User preferences

_Populate as you build_

## Gotchas

- Owner login: username `ptuser`, password from `OWNER_PASSWORD` env var
- Server listens on `0.0.0.0:5000` for Replit preview compatibility

## Pointers

- Workflows skill: `.local/skills/workflows/SKILL.md`
- Deployment skill: `.local/skills/deployment/SKILL.md`
