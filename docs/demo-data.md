# Demo data

How to fill the demo account with body weights and workout checks so the
Today card, weight trend, BMI, and activity heatmap have something to show.

Script: [`scripts/seed-demo.sh`](../scripts/seed-demo.sh) (wraps
[`scripts/seed-demo.py`](../scripts/seed-demo.py)).

## Prerequisites

- `gcloud` installed and signed in with an account that has Firestore access to
  the project (default: `graphland.dev@gmail.com`).
- `python3` (standard library only, nothing to install).
- `.env.local` contains `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.

If the token has expired:

```bash
gcloud auth login graphland.dev@gmail.com
```

## Quick start

```bash
# See what would be written, without writing anything
scripts/seed-demo.sh --dry-run

# Write it
scripts/seed-demo.sh
```

Default run fills the demo user (`wQFKm8g8Sugi83ACdWsTRUBe6ts1`) with:

- **Weigh-ins** for the last 60 days (about 1 in 4 days skipped)
- **Workout checks** for the last 90 days, following the user's current
  weekly schedule (about 85% of scheduled days trained)

Everything stops at **yesterday**, so today can be logged live during a demo.

## Topping up later

Run the same command again whenever you want fresh data:

```bash
scripts/seed-demo.sh
```

Days that already have data are skipped, so re-running only fills the days
since the last run plus any gaps. Real entries (logged in the app) are never
overwritten.

New weigh-ins continue the trend: between existing entries they interpolate,
after the latest entry they keep drifting down slowly (~0.06 kg/day), and
before the first entry they get a bit heavier going back.

## Common recipes

| Goal | Command |
| --- | --- |
| Preview only | `scripts/seed-demo.sh --dry-run` |
| Go further back | `scripts/seed-demo.sh --weight-days 180 --log-days 180` |
| Include today | `scripts/seed-demo.sh --include-today` |
| Only weigh-ins | `scripts/seed-demo.sh --only weights` |
| Only workout checks | `scripts/seed-demo.sh --only logs` |
| Log every day (no gaps) | `scripts/seed-demo.sh --skip-rate 0` |
| Perfect attendance | `scripts/seed-demo.sh --attendance 1` |
| Same output every run | `scripts/seed-demo.sh --seed 42` |
| Remove all demo data | `scripts/seed-demo.sh --clear` |
| Remove only demo weigh-ins | `scripts/seed-demo.sh --clear --only weights` |

## All options

| Flag | Default | Meaning |
| --- | --- | --- |
| `--weight-days N` | `60` | How many days back to fill weigh-ins |
| `--log-days N` | `90` | How many days back to fill workout checks |
| `--end-kg KG` | `83.2` | Starting weight when the user has no weigh-ins yet |
| `--skip-rate R` | `0.25` | Chance (0–1) to skip a weigh-in day |
| `--attendance R` | `0.85` | Chance (0–1) to train on a scheduled day |
| `--include-today` | off | Also fill today |
| `--only weights\|logs` | both | Seed just one kind of data |
| `--clear` | off | Delete every sample doc instead of seeding |
| `--dry-run` | off | Print what would be written, write nothing |
| `--seed N` | random | Random seed for reproducible output |

Run `scripts/seed-demo.sh --help` for the same list.

## Environment overrides

| Variable | Default | Use |
| --- | --- | --- |
| `DEMO_UID` | `wQFKm8g8Sugi83ACdWsTRUBe6ts1` | Seed a different user |
| `GCLOUD_ACCOUNT` | `graphland.dev@gmail.com` | gcloud account used for the token |
| `FIREBASE_PROJECT` | from `.env.local` | Target a different project |

Example:

```bash
DEMO_UID=someOtherUid scripts/seed-demo.sh --dry-run
```

## What gets written

All docs live under `users/{uid}/` and carry `sample: true` so `--clear` can
find them.

| Collection | Doc id | Fields |
| --- | --- | --- |
| `bodyWeights` | `YYYY-MM-DD` | `date`, `kg`, `sample`, `updatedAt` |
| `logs` | `YYYY-MM-DD_{exerciseId}` | `date`, `exerciseId`, `workoutId`, `done`, `sample`, `createdAt`, `updatedAt` |

Workout checks need the user to have workouts and a schedule (set up in
**Plan**); otherwise the logs step is skipped.

If you edit a sample weigh-in in the app, it's saved without the `sample` flag
and becomes a real entry that `--clear` keeps.

## Troubleshooting

| Message | Fix |
| --- | --- |
| `No gcloud token for …` | `gcloud auth login <account>` |
| `Firestore … failed (403)` | That account can't access the project; set `GCLOUD_ACCOUNT` to one that can |
| `logs: skipped (no workouts or schedule yet)` | Create workouts and assign weekdays in Plan first |
| Nothing new written | Every day in range already has data; widen `--weight-days` / `--log-days` |
