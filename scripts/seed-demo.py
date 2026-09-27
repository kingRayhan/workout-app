#!/usr/bin/env python3
"""Seed demo body weights + workout logs for one user via the Firestore REST API.

Run through scripts/seed-demo.sh (it supplies the access token and project).
Safe to re-run: dates that already have data are never overwritten, so running
it again later only fills new days and gaps. Every written doc has sample=true.
"""

import argparse
import datetime as dt
import json
import math
import os
import random
import sys
import urllib.error
import urllib.request

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("uid", help="Firebase Auth user id")
p.add_argument("--project", required=True)
p.add_argument("--weight-days", type=int, default=60, help="how many days back to fill weigh-ins (default 60)")
p.add_argument("--log-days", type=int, default=90, help="how many days back to fill workout checks (default 90)")
p.add_argument("--end-kg", type=float, default=83.2, help="anchor weight when the user has no weigh-ins yet")
p.add_argument("--skip-rate", type=float, default=0.25, help="chance to skip a weigh-in day (default 0.25)")
p.add_argument("--attendance", type=float, default=0.85, help="chance to train on a scheduled day (default 0.85)")
p.add_argument("--include-today", action="store_true", help="also fill today (default: up to yesterday)")
p.add_argument("--only", choices=["weights", "logs"], help="seed just one kind of data")
p.add_argument("--clear", action="store_true", help="delete every sample=true doc instead of seeding")
p.add_argument("--dry-run", action="store_true", help="print what would be written")
p.add_argument("--seed", type=int, help="random seed for reproducible output")
args = p.parse_args()

TOKEN = os.environ.get("TOKEN")
if not TOKEN:
    sys.exit("TOKEN env var missing (run via scripts/seed-demo.sh)")

ROOT = f"projects/{args.project}/databases/(default)/documents"
API = f"https://firestore.googleapis.com/v1/{ROOT}"
USER = f"{ROOT}/users/{args.uid}"
random.seed(args.seed)


def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Authorization", f"Bearer {TOKEN}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r) as resp:
            return json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {}
        sys.exit(f"Firestore {method} failed ({e.code}): {e.read().decode()[:300]}")


def list_docs(col):
    out, token = [], None
    while True:
        url = f"{API}/users/{args.uid}/{col}?pageSize=300" + (f"&pageToken={token}" if token else "")
        d = req("GET", url)
        out += d.get("documents", [])
        token = d.get("nextPageToken")
        if not token:
            return out


def val(v):
    return list(v.values())[0]


def commit(writes):
    if args.dry_run:
        for w in writes[:10]:
            print("  ", "delete" if "delete" in w else "set", (w.get("delete") or w["update"]["name"]).split("/users/")[-1])
        if len(writes) > 10:
            print(f"   … {len(writes) - 10} more")
        return
    for i in range(0, len(writes), 400):
        req("POST", f"{API}:commit", {"writes": writes[i : i + 400]})


now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
today = dt.date.today()
last_day = today if args.include_today else today - dt.timedelta(days=1)

if args.clear:
    deletes = []
    for col in ("bodyWeights", "logs"):
        if args.only and col != {"weights": "bodyWeights", "logs": "logs"}[args.only]:
            continue
        for d in list_docs(col):
            if d.get("fields", {}).get("sample", {}).get("booleanValue"):
                deletes.append({"delete": d["name"]})
    commit(deletes)
    print(f"{'would delete' if args.dry_run else 'deleted'} {len(deletes)} sample docs")
    sys.exit(0)

writes = []
summary = []

if args.only in (None, "weights"):
    existing = sorted(
        (d["name"].split("/")[-1], float(val(d["fields"]["kg"])))
        for d in list_docs("bodyWeights")
        if "kg" in d.get("fields", {})
    )
    known = dict(existing)
    dates = sorted(known)

    def estimate(day: dt.date) -> float:
        """Interpolate between known weigh-ins; drift gently outside them."""
        key = day.isoformat()
        if not dates:
            return args.end_kg + (last_day - day).days * 0.09
        before = [k for k in dates if k < key]
        after = [k for k in dates if k > key]
        if before and after:
            a, b = before[-1], after[0]
            da, db = dt.date.fromisoformat(a), dt.date.fromisoformat(b)
            t = (day - da).days / (db - da).days
            return known[a] + (known[b] - known[a]) * t
        if before:  # after the latest weigh-in: keep losing slowly
            a = before[-1]
            return known[a] - (day - dt.date.fromisoformat(a)).days * 0.06
        b = after[0]  # before the first weigh-in: a bit heavier going back
        return known[b] + (dt.date.fromisoformat(b) - day).days * 0.09

    count = 0
    for i in range((last_day - (today - dt.timedelta(days=args.weight_days))).days, -1, -1):
        day = last_day - dt.timedelta(days=i)
        key = day.isoformat()
        if key in known or random.random() < args.skip_rate:
            continue
        noise = math.sin(day.toordinal() * 1.7) * 0.3 + random.uniform(-0.25, 0.25)
        kg = round(estimate(day) + noise, 1)
        writes.append({
            "update": {
                "name": f"{USER}/bodyWeights/{key}",
                "fields": {
                    "date": {"stringValue": key},
                    "kg": {"doubleValue": kg},
                    "sample": {"booleanValue": True},
                    "updatedAt": {"timestampValue": now},
                },
            }
        })
        count += 1
    summary.append(f"weigh-ins: {count}")

if args.only in (None, "logs"):
    workouts = {
        d["name"].split("/")[-1]: [val(x) for x in d["fields"].get("exerciseIds", {}).get("arrayValue", {}).get("values", [])]
        for d in list_docs("workouts")
    }
    schedule_doc = req("GET", f"{API}/users/{args.uid}/schedule/current").get("fields", {})
    schedule = {k: val(v) for k, v in schedule_doc.items() if k in WEEKDAYS}
    if not schedule or not workouts:
        summary.append("logs: skipped (no workouts or schedule yet)")
    else:
        logged_dates = {val(d["fields"]["date"]) for d in list_docs("logs") if "date" in d.get("fields", {})}
        checks = trained = 0
        for i in range(args.log_days, -1, -1):
            day = today - dt.timedelta(days=i)
            if day > last_day:
                continue
            key = day.isoformat()
            wid = schedule.get(WEEKDAYS[day.weekday()])
            if not wid or wid not in workouts or key in logged_dates:
                continue
            if random.random() > args.attendance:
                continue
            exercises = workouts[wid]
            if not exercises:
                continue
            done_n = max(1, round(len(exercises) * random.choice([0.5, 0.7, 0.85, 1, 1, 1])))
            trained += 1
            for ex in exercises[:done_n]:
                writes.append({
                    "update": {
                        "name": f"{USER}/logs/{key}_{ex}",
                        "fields": {
                            "date": {"stringValue": key},
                            "exerciseId": {"stringValue": ex},
                            "workoutId": {"stringValue": wid},
                            "done": {"booleanValue": True},
                            "sample": {"booleanValue": True},
                            "createdAt": {"timestampValue": now},
                            "updatedAt": {"timestampValue": now},
                        },
                    }
                })
                checks += 1
        summary.append(f"workout checks: {checks} across {trained} days")

commit(writes)
print(("[dry run] " if args.dry_run else "") + " · ".join(summary))
