# Sleeper-based Fantasy Football Draft Tracker — Architecture Plan

## Context

A static website (deployed to Cloudflare Pages) that uses Sleeper's public, unauthenticated,
read-only API to (1) follow a Sleeper draft room live, as fast as polling allows, and (2) show
which players are still available. It must work well on both wide screens and mobile — in
particular, the wide-screen layout is meant to work on a **projector/TV at a draft party**.

Confirmed choices: React + Vite + TypeScript + Tailwind, pnpm, and the landing page supports
both a username→league→draft lookup flow _and_ pasting a draft ID/URL directly.

## Sleeper API surface used (base `https://api.sleeper.app/v1`, no auth, CORS-open)

- `GET /user/<username>` → `{user_id, display_name, avatar}`
- `GET /user/<user_id>/leagues/nfl/<season>` → leagues for that user/season
- `GET /league/<league_id>`, `/users`, `/rosters`, `/drafts` → league context + roster/owner names
- `GET /draft/<draft_id>` → draft metadata: `status`, `type` (snake/linear/auction), `settings.pick_timer`,
  `draft_order`, `slot_to_roster_id`, `last_picked`
- `GET /draft/<draft_id>/picks` → picks made so far (`round`, `draft_slot`, `pick_no`, `player_id`, `roster_id`)
- `GET /players/nfl` → full player dictionary (~5MB). Sleeper's own guidance: fetch at most once/day.
- `GET /state/nfl` → current season/week, used to default the season selector
- Avatars: `https://sleepercdn.com/avatars/thumbs/<avatar_id>`; headshots: `https://sleepercdn.com/content/nfl/players/thumb/<player_id>.jpg`

## Polling strategy

- Picks: poll every 3s while `draft.status === 'drafting'` (matches Sleeper's own client cadence);
  drop to a slow/no-op interval once `status === 'complete'`; pause the interval when
  `document.hidden` (resume on visibility) so a backgrounded tab doesn't keep hammering the API.
- Draft metadata: poll every ~10s to catch status transitions and recompute "on the clock" /
  time-remaining from `last_picked` + `settings.pick_timer`.
- Implemented with TanStack Query (`refetchInterval` as a function of query data, so cadence
  self-adjusts as `status` changes).

## Available-players derivation

Fetch `/players/nfl` once, cache it in IndexedDB (via `idb-keyval` — the ~5MB payload is too
large/risky for `localStorage`'s per-origin quota) with a timestamp; refetch only if >24h stale.
Filter to players with a non-empty `fantasy_positions`. Available = filtered player map minus the
set of `player_id`s already present in the current draft's picks. Support search-by-name, position
filter chips (QB/RB/WR/TE/FLEX/K/DEF, where FLEX is a derived filter matching RB/WR/TE), and
default sort by Sleeper's own `search_rank`.

## Pages

1. **`/` Landing** — two entry paths (stacked on mobile, side-by-side on wide screens):
   - Username → season-scoped league list → draft list → navigate to draft room.
   - Paste a draft ID or full Sleeper draft URL (parsed) → navigate directly.
   - Recently-viewed draft IDs cached in `localStorage` for quick return.
2. **`/draft/:draftId` Draft Room** (core feature):
   - Header: league name, draft type, round/pick progress, on-the-clock + countdown, small
     "live"/last-updated indicator.
   - Wide layout is built for a **projector/TV at a draft party**, not just a desktop browser: the
     draft board dominates the width with large boxes and large text, legible from across a room.
     Available Players is a genuinely thin sidebar (fixed narrow width, e.g. ~280–320px, not a
     proportional split) — compact rows, smaller text, since it's a reference list someone glances
     at up close rather than the thing being read from a distance. Recent-picks feed lives below/within
     that thin sidebar, not competing with the board for width.
   - Mobile layout: tab bar switching between Board / Available / Picks (single column, no sidebar,
     each view full-width there since there's no room-viewing-distance concern on a phone).
   - Draft board: rounds × slots grid; slots labeled via `slot_to_roster_id` + league users/rosters
     when available, else "Slot N" (so it still works for a mock/orphan draft with no league). Most
     recent pick cell is highlighted with a large, high-contrast treatment (readable from a distance).
   - Available Players: search + position filter (incl. FLEX = RB/WR/TE) + team filter, sorted by
     `search_rank`, virtualized list (500+ entries), compact/dense rows on wide screens.
3. **`/league/:leagueId`** — thin league overview (its drafts) so the flow is linkable/shareable.

## Data layer (`src/api/sleeper.ts`, `src/hooks/*`)

- `sleeper.ts`: typed fetch wrappers + TS interfaces for User/League/Draft/Pick/Player.
- `usePlayers()` — TanStack Query + `idb-keyval` persistence, 24h staleTime.
- `useDraft(draftId)`, `useDraftPicks(draftId)` — the two polling hooks described above.
- `useAvailablePlayers(draftId)` — derives from the above two.
- `useLeagueUsers(leagueId)` / `useLeagueRosters(leagueId)` — name/avatar mapping for the board.

## Project setup

- Scaffold Vite React-TS into the existing repo without clobbering README/LICENSE/.gitignore.
- Checked `/Repositories/keetar` for house conventions to mirror: it's a webpack-based browser
  extension with no Tailwind, no ESLint/Prettier, and no state/data-fetching library, so there's
  no established convention to carry over — proceeding with straightforward defaults below. The
  one thing worth matching is the `packageManager`/`engines` pinning style it uses.
- Deps: `react-router-dom`, `@tanstack/react-query`, `idb-keyval`, Tailwind CSS v4 (via the
  `@tailwindcss/vite` plugin — no separate config file needed), ESLint flat config
  (`typescript-eslint` + `eslint-plugin-react-hooks`) + Prettier.
- `tsconfig`: `strict: true`, path alias `@/*` → `src/*`.
- `package.json` pins `packageManager: pnpm@<current>` and an `engines.node` floor, matching the
  pinning style seen in keetar's root `package.json`.
- Cloudflare Pages: static `dist/` output, `public/_redirects` containing `/* /index.html 200` for
  SPA routing, optional `wrangler.toml`. No functions/secrets needed — the browser calls Sleeper
  directly.
- Update README with dev/build/deploy instructions.

## Verification

- `pnpm install && pnpm build` succeeds with no type errors.
- `pnpm dev`, manually exercise: username lookup → league → draft; direct draft-ID paste; confirm
  the draft board updates within a few seconds of a real pick (test against a live/mock Sleeper
  draft — will need a draft ID/username to test against if one isn't obviously public).
- Resize/inspect at mobile and wide-screen widths to confirm the tab-bar vs sidebar layouts both
  work, and that on a wide/TV-sized viewport the board's boxes/text read clearly from a distance
  while the players sidebar stays thin.
