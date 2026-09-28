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

# Target per exercise: (kg or None for bodyweight, sets, reps, rest seconds).
# Sized for an ~83 kg beginner-intermediate lifter.
LIFTS = {
    "leg-press": (120, 4, 12, 90),
    "leg-curl": (35, 3, 15, 60),
    "leg-extension": (45, 3, 15, 60),
    "inner-thigh": (45, 3, 15, 60),
    "outer-thigh": (45, 3, 15, 60),
    "smith-machine-squat": (50, 4, 12, 90),
    "glute-kickback": (30, 3, 15, 60),
    "side-raise": (8, 3, 15, 60),
    "front-raise": (8, 3, 15, 60),
    "front-shoulder-press": (30, 3, 12, 90),
    "shoulder-raise-machine": (30, 3, 15, 60),
    "face-pull": (38, 3, 15, 60),
    "shrugs": (22, 3, 15, 60),
    "incline-db-press": (20, 3, 12, 90),
    "chest-press": (50, 4, 12, 90),
    "machine-fly": (45, 3, 15, 60),
    "chest-dips": (None, 3, 10, 90),
    "pull-over": (16, 3, 15, 60),
    "overhead-extension": (25, 3, 15, 60),
    "push-down": (30, 3, 15, 60),
    "triceps-dips": (None, 3, 12, 60),
    "triceps-machine-extension": (35, 3, 15, 60),
    "t-bar-row": (40, 4, 12, 90),
    "front-lat-pulldown": (55, 4, 12, 90),
    "v-bar-row": (50, 3, 12, 90),
    "single-arm-low-row": (25, 3, 12, 60),
    "power-rack-chinup": (None, 3, 8, 120),
    "hyperextension": (None, 3, 15, 60),
    "barbell-curl": (25, 3, 12, 60),
    "preacher-curl": (25, 3, 12, 60),
    "hammer-curl": (12, 3, 12, 60),
    "biceps-machine-curl": (30, 3, 15, 60),
    "ab-machine-crunch": (35, 3, 20, 45),
    "waist-rotary": (30, 3, 15, 45),
}
DUMBBELL = {"side-raise", "front-raise", "shrugs", "incline-db-press", "pull-over", "hammer-curl"}

p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("uid", help="Firebase Auth user id")
p.add_argument("--project", required=True)
p.add_argument("--weight-days", type=int, default=60, help="how many days back to fill weigh-ins (default 60)")
p.add_argument("--log-days", type=int, default=90, help="how many days back to fill workout checks (default 90)")
p.add_argument("--end-kg", type=float, default=83.2, help="anchor weight when the user has no weigh-ins yet")
p.add_argument("--skip-rate", type=float, default=0.25, help="chance to skip a weigh-in day (default 0.25)")
p.add_argument("--attendance", type=float, default=0.85, help="chance to train on a scheduled day (default 0.85)")
p.add_argument("--include-today", action="store_true", help="also fill today (default: up to yesterday)")
p.add_argument("--only", choices=["weights", "logs", "lifts"], help="seed just one kind of data")
p.add_argument("--clear", action="store_true", help="delete every sample=true doc instead of seeding")
p.add_argument("--reweight", action="store_true", help="recompute sets/reps/weight on sample logs (after editing LIFTS)")
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


def num(v):
    """Firestore number value → float, or None."""
    if not v:
        return None
    if "integerValue" in v:
        return float(v["integerValue"])
    if "doubleValue" in v:
        return float(v["doubleValue"])
    return None


def settings_path(ex):
    return f"exerciseSettings.`{ex}`"


def load_workouts():
    """{workout id: {"doc": name, "ids": [...], "settings": {ex: fields}}}"""
    out = {}
    for d in list_docs("workouts"):
        f = d.get("fields", {})
        ids = [val(x) for x in f.get("exerciseIds", {}).get("arrayValue", {}).get("values", [])]
        settings = f.get("exerciseSettings", {}).get("mapValue", {}).get("fields", {})
        out[d["name"].split("/")[-1]] = {
            "doc": d["name"],
            "ids": ids,
            "settings": {k: v.get("mapValue", {}).get("fields", {}) for k, v in settings.items()},
        }
    return out


def resolve_targets(workouts):
    """Per exercise (kg, sets, reps): the user's own settings win over LIFTS."""
    targets = {ex: t[:3] for ex, t in LIFTS.items()}
    for w in workouts.values():
        for ex, s in w["settings"].items():
            if s.get("sample", {}).get("booleanValue"):
                continue
            sets, reps = num(s.get("sets")), num(s.get("reps"))
            if sets and reps:
                targets[ex] = (num(s.get("weightKg")), int(sets), int(reps))
    return targets


def lift_for(ex, day, targets):
    """What was lifted on `day`: one weight step lighter every three weeks back."""
    if ex not in targets:
        return None
    kg, sets, reps = targets[ex]
    back = max(0, (last_day - day).days)
    if kg is None:
        weight, r = None, max(reps - 4, reps - back // 21, 1)
    else:
        step = 2 if ex in DUMBBELL else (5 if kg >= 60 else 2.5)
        weight = max(kg - step * (back // 21), round(kg * 0.6 * 4) / 4)
        # First week at a new weight: fewer reps.
        r = max(6, reps - 3) if back % 21 >= 14 and weight > kg * 0.6 else reps
    fields = {
        "sets": {"integerValue": str(sets)},
        "reps": {"integerValue": str(r)},
        "weightKg": {"nullValue": None} if weight is None else {"doubleValue": weight},
    }
    return fields


if args.clear:
    deletes = []
    for col in ("bodyWeights", "logs"):
        if args.only and col != {"weights": "bodyWeights", "logs": "logs"}.get(args.only):
            continue
        for d in list_docs(col):
            if d.get("fields", {}).get("sample", {}).get("booleanValue"):
                deletes.append({"delete": d["name"]})
    doc_count = len(deletes)
    cleared_settings = 0
    if args.only in (None, "lifts"):
        for w in load_workouts().values():
            paths = [
                settings_path(ex)
                for ex, s in w["settings"].items()
                if s.get("sample", {}).get("booleanValue")
            ]
            if paths:
                cleared_settings += len(paths)
                deletes.append({
                    "update": {"name": w["doc"], "fields": {}},
                    "updateMask": {"fieldPaths": paths},
                })
    commit(deletes)
    verb = "would delete" if args.dry_run else "deleted"
    print(f"{verb} {doc_count} sample docs and {cleared_settings} sample exercise targets")
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

workout_docs = load_workouts() if args.only in (None, "logs", "lifts") else {}
targets = resolve_targets(workout_docs)

if args.only in (None, "lifts"):
    set_count = 0
    for w in workout_docs.values():
        missing = [ex for ex in w["ids"] if ex not in w["settings"] and ex in LIFTS]
        if not missing:
            continue
        fields = {}
        for ex in missing:
            kg, sets, reps, rest = LIFTS[ex]
            fields[ex] = {"mapValue": {"fields": {
                "sets": {"integerValue": str(sets)},
                "reps": {"integerValue": str(reps)},
                "weightKg": {"nullValue": None} if kg is None else {"doubleValue": kg},
                "restSec": {"integerValue": str(rest)},
                "sample": {"booleanValue": True},
            }}}
        writes.append({
            "update": {"name": w["doc"], "fields": {"exerciseSettings": {"mapValue": {"fields": fields}}}},
            "updateMask": {"fieldPaths": [settings_path(ex) for ex in missing]},
        })
        set_count += len(missing)
    summary.append(f"exercise targets: {set_count}")

    filled = 0
    for d in list_docs("logs"):
        f = d.get("fields", {})
        if f.get("done", {}).get("booleanValue") is False:
            continue
        is_sample = f.get("sample", {}).get("booleanValue")
        if ("sets" in f or "weightKg" in f) and not (args.reweight and is_sample):
            continue
        ex, date = f.get("exerciseId", {}).get("stringValue"), f.get("date", {}).get("stringValue")
        if not ex or not date:
            continue
        lift = lift_for(ex, dt.date.fromisoformat(date), targets)
        if not lift:
            continue
        writes.append({
            "update": {"name": d["name"], "fields": lift},
            "updateMask": {"fieldPaths": list(lift)},
        })
        filled += 1
    summary.append(f"weights added to existing logs: {filled}")

if args.only in (None, "logs"):
    workouts = {wid: w["ids"] for wid, w in workout_docs.items()}
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
                            **(lift_for(ex, day, targets) or {}),
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
