# workoutland

Bun workspaces monorepo.

| Path | What |
| --- | --- |
| `apps/mobile` | The mobile-first gym companion app (`@workoutland/mobile`, port 3000) |
| `apps/site` | Public site: machines, workouts, blog (`@workoutland/site`, port 3001) |
| `packages/data` | Shared plan, machines, exercises, media + machine photos (`@workoutland/data`) |
| `scripts/` | Repo tooling, e.g. demo data seeding ([docs](docs/demo-data.md)) |
| `docs/` | Specs and guides |
| `firestore.rules` | Firestore security rules |

## Getting started

```bash
bun install
cp apps/mobile/.env.example apps/mobile/.env.local   # fill in Firebase config
cp apps/site/.env.example apps/site/.env.local       # optional: app URL for the site's CTA
bun dev          # all apps via mprocs (mobile :3000, site :3001)
```

## Scripts (run from the repo root)

| Command | Does |
| --- | --- |
| `bun dev` | All apps in one terminal via [mprocs](https://github.com/pvolok/mprocs) (`mprocs.yaml`) |
| `bun dev:mobile` / `bun dev:site` | Dev server for a single app |
| `bun run build` | Production build of every app |
| `bun start` / `bun start:site` | Serve a production build |
| `bun lint` | Lint every workspace |
| `bun typecheck` | Typecheck `@workoutland/data` |
| `bun seed:demo` | Seed demo data into Firestore |

To run a script in one workspace: `bun --filter @workoutland/site <script>`.
To add a dependency to one app: `bun add <pkg> --cwd apps/site`.

## Shared data

Import from subpaths, e.g. `import { MACHINES } from "@workoutland/data/machines"`
(`plan`, `machines`, `cardio`, `media`, `exercise-extra`, `catalog`).

Machine photos live in `packages/data/assets/machines`, and the 3D icons in
`assets/icons` and `assets/shortcuts`. Each app's `predev` / `prebuild` runs
`workoutland-copy-assets`, which copies those folders into the app's `public/`
(gitignored).

## Blog posts

Add `apps/site/src/content/blog/<slug>.mdx` and an entry in
`apps/site/src/content/posts.ts`.

## Adding a shared package

Create `packages/<name>/package.json` with `"name": "@workoutland/<name>"`, then
depend on it from an app with `"@workoutland/<name>": "workspace:*"` and run
`bun install`. Turbopack compiles workspace TypeScript directly; no build step
or `transpilePackages` needed.
