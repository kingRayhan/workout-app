# Data model (Firestore)

Companion to [SRS.md](./SRS.md). Product terms: [glossary.md](./glossary.md).  
All user data is scoped under the authenticated Google `uid`.

## 1. Path layout

Preferred product-aligned paths:

```text
users/{uid}
  displayName, email, photoURL, createdAt, updatedAt

users/{uid}/workouts/{workoutId}
  name, exerciseIds[], createdAt, updatedAt

users/{uid}/schedule                 # single doc
  mon, tue, wed, thu, fri, sat, sun  → workoutId | null
  updatedAt

users/{uid}/logs/{logId}             # logId = `${date}_${exerciseId}`
  date            # "YYYY-MM-DD" local calendar date
  exerciseId      # catalog id
  workoutId       # optional; workout scheduled that day
  done            # true while present
  note            # optional string
  createdAt, updatedAt
```

> Implementation note: early drafts used `sets` / `weekdayPlan`. Prefer `workouts` / `schedule` for new code.

## 2. Field dictionaries

### 2.1 `users/{uid}`

| Field | Type | Notes |
| --- | --- | --- |
| displayName | string | From Google profile |
| email | string | From Google profile |
| photoURL | string \| null | From Google profile |
| createdAt | timestamp | Server/client set once |
| updatedAt | timestamp | |

### 2.2 `users/{uid}/workouts/{workoutId}`

| Field | Type | Notes |
| --- | --- | --- |
| name | string | 1–60 chars, e.g. `Legs + shoulders` |
| exerciseIds | string[] | Ordered catalog exercise ids |
| sourceTemplate | string \| null | e.g. `trainer-day-1` if imported |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints**

- `exerciseIds` must reference known catalog ids only (client validates).
- Max exercises per workout (v1 soft limit): **40**.

### 2.3 `users/{uid}/schedule`

| Field | Type | Notes |
| --- | --- | --- |
| mon…sun | string \| null | `workoutId` or null |
| updatedAt | timestamp | |

Scheduling Saturday → Legs workout:

```json
{ "sat": "abc123WorkoutId", "mon": null }
```

### 2.4 `users/{uid}/logs/{logId}`

Backs the **daily todolist** (not shown as “logs” in UI).

| Field | Type | Notes |
| --- | --- | --- |
| date | string | `YYYY-MM-DD` |
| exerciseId | string | Catalog id |
| workoutId | string \| null | Context |
| done | boolean | Prefer **delete doc on uncheck** |
| note | string \| null | Optional; max 200 chars |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**logId:** `` `${date}_${exerciseId}` `` — one completion per exercise per day.

## 3. Activity derivation (from daily todolist)

For each date `D` in range:

1. Count logs where `date == D` → `n`.
2. `scheduledWorkout = schedule[weekday(D)]`.
3. `required = scheduledWorkout.exerciseIds.length` if scheduled, else `0`.
4. Intensity:
   - `0` if `n == 0`
   - `1` if `n >= 1` and (`required == 0` or `n < required`)
   - `2` if `required > 0` and `n >= required`

## 4. Security rules (intent)

```text
match /users/{uid}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

No public list of users. Catalog is not in Firestore.

## 5. Indexes

- v1 may fetch last 12 months of logs: `date >= start && date <= end`.

## 6. Catalog IDs (static)

User `exerciseIds` reference static modules, e.g. `leg-press`, `leg-curl` (see `src/data/plan.ts`).

Renaming catalog **ids** is a breaking change; display names may change freely.
