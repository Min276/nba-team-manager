# NBA Team Manager

A small Next.js app for building teams out of NBA players: log in with a username,
browse players with infinite scroll, and create / edit / delete teams with rosters.
All app state survives a page reload.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then paste your key
pnpm dev
```

The players list is backed by the [balldontlie](https://www.balldontlie.io) API,
which requires a free API key from [app.balldontlie.io](https://app.balldontlie.io).
Put it in `.env.local` as `BALLDONTLIE_API_KEY`. The key never reaches the browser:
requests go through a Next.js route handler (`/api/players`) that adds the header.

> The endpoint named in the brief (`www.balldontlie.io/api/v1/players`) has been
> retired upstream (it returns 404); the app uses its successor
> `api.balldontlie.io/v1/players`, which is cursor-paginated and key-protected.
> The free tier is rate limited, so scrolling quickly can hit a 429 - the UI
> shows the message and offers a retry.

Scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.

## Features

- **Authentication** - username-only login (no API), name shown in the header, log out.
  Routes under `(protected)` redirect to `/login` when signed out.
- **Players** - 10 players per request, infinite scroll via `IntersectionObserver`
  with a _Load more_ button as a fallback, skeleton while loading, error states
  with retry for both the first page and subsequent pages.
- **Teams** - listing, create, update and delete, all in modals. Form fields:
  name (required, unique regardless of case), player count (1-30, and never below
  the current roster), region, country. Inline validation errors.
- **Rosters** - add a player to a team from the players page, remove from either
  page. A player can be on at most one team, a team can't exceed its player count,
  and deleting a team releases its players.
- **Persistence** - auth and teams are stored in `localStorage` and restored on
  load; the API cache and error states are deliberately not persisted.

## Architecture

```
src/
  app/                    routes (App Router)
    (protected)/          layout wraps pages in AuthGuard: /, /players, /teams
    login/
    api/players/route.ts  server-side proxy to balldontlie (adds the API key,
                          normalises the payload, caches upstream pages for 1h)
  features/
    auth/                 authSlice + LoginForm
    players/              playersApi (RTK Query infinite query), PlayerList,
                          PlayerRow, AssignPlayerModal, useInfiniteScroll
    teams/                teamsSlice (entity adapter + selectors), validation,
                          TeamList, TeamCard, TeamFormModal, DeleteTeamModal
  components/
    ui/                   Button, Field/Input/Select, Modal (<dialog>)
    layout/               Header, AuthGuard
  lib/                    store, typed hooks, persistence, StoreProvider
```

### State management

Redux Toolkit with react-redux. Three slices live in the store:

| slice        | contents                                   | persisted |
| ------------ | ------------------------------------------ | --------- |
| `auth`       | `{ user }`                                 | yes       |
| `teams`      | entity adapter of teams, each with players | yes       |
| `playersApi` | RTK Query cache for `/api/players`         | no        |

Teams embed a snapshot of each player (id, name, position, NBA team) so a roster
renders without re-fetching, and "one team per player" is enforced in the reducer
and derived for the UI through a memoized `playerId -> team` selector.

### Persistence

`lib/persistence.ts` is ~40 lines instead of `redux-persist`:

- the `StoreProvider` dispatches `hydrate(loadPersistedState())` **after mount**,
  so server and client render the same initial HTML (no hydration mismatch), and
  a `hydrated` flag keeps the auth guard from redirecting before that;
- a store subscriber writes the persisted slices only when their references change,
  so API traffic never touches `localStorage`;
- the storage key is versioned (`nba-team-manager:v1`); corrupt or missing data
  falls back to the initial state.

### Performance

- `PlayerRow` and `TeamCard` are memoized and receive stable callbacks, so loading
  another page or changing a roster re-renders only the rows that changed.
- Rows use `content-visibility: auto`, letting the browser skip layout and paint
  for off-screen rows - smooth scrolling into the hundreds of rows without a
  virtualisation library (the upgrade path if lists reach the thousands).
- One modal instance per page, never one per row.
- Selectors are memoized (`createSelector` / entity adapter), and the persistence
  subscriber bails out with reference checks before serialising anything.
- The route handler caches upstream pages (`next.revalidate`), so reloads and
  other users don't burn the rate limit for the same pages.

### Decisions worth knowing

- **Player count = roster capacity.** The brief lists it as a form field, so it is
  treated as the maximum roster size; adding beyond it is blocked and the count
  can't be edited below the current roster.
- **Native `<dialog>` for modals** - focus trapping, `Esc`, the backdrop and
  `inert` background come from the platform; the component is 40 lines.
- **Hand-rolled validation** rather than a form library: the unique-name rule needs
  the store anyway, and the whole validator fits in one small, unit-tested function.

## Tests

`pnpm test` runs Vitest over the pure logic: team rules (uniqueness, capacity,
release on delete, count floor, hydrate), form validation and the persistence
round trip. UI behaviour was verified manually in the browser.
