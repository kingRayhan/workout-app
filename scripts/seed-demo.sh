#!/usr/bin/env bash
# Seed demo data (body weights, workout checks, lifted weights) into Firestore
# for one user.
#
#   scripts/seed-demo.sh                      # fill last 60d weights, 90d logs
#   scripts/seed-demo.sh --weight-days 120    # go further back
#   scripts/seed-demo.sh --include-today      # also fill today
#   scripts/seed-demo.sh --only logs          # just workout checks
#   scripts/seed-demo.sh --only lifts         # exercise targets + log weights
#   scripts/seed-demo.sh --dry-run            # preview, write nothing
#   scripts/seed-demo.sh --clear              # remove all sample data
#
# Re-running only fills days that have no data yet, so run it again later to
# top up recent days. Real entries are never touched.
#
# Env overrides:
#   DEMO_UID        Firebase user id   (default: demo account)
#   GCLOUD_ACCOUNT  gcloud account with Firestore access
#   FIREBASE_PROJECT  project id       (default: from .env.local)
set -euo pipefail

cd "$(dirname "$0")/.."

DEMO_UID="${DEMO_UID:-wQFKm8g8Sugi83ACdWsTRUBe6ts1}"
GCLOUD_ACCOUNT="${GCLOUD_ACCOUNT:-graphland.dev@gmail.com}"

if [[ -z "${FIREBASE_PROJECT:-}" && -f .env.local ]]; then
  FIREBASE_PROJECT="$(grep -E '^NEXT_PUBLIC_FIREBASE_PROJECT_ID=' .env.local | cut -d= -f2- | tr -d '"'"'"' ')"
fi
if [[ -z "${FIREBASE_PROJECT:-}" ]]; then
  echo "Set FIREBASE_PROJECT or NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local" >&2
  exit 1
fi

if ! TOKEN="$(gcloud auth print-access-token --account="$GCLOUD_ACCOUNT" 2>/dev/null)"; then
  echo "No gcloud token for $GCLOUD_ACCOUNT. Run: gcloud auth login $GCLOUD_ACCOUNT" >&2
  exit 1
fi

echo "→ $FIREBASE_PROJECT · user $DEMO_UID"
TOKEN="$TOKEN" exec python3 scripts/seed-demo.py "$DEMO_UID" --project "$FIREBASE_PROJECT" "$@"
