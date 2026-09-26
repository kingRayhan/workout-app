# User flows (mobile-first)

Companion to [SRS.md](./SRS.md). Vocabulary: [glossary.md](./glossary.md).  
Layout assumes ~390px width, bottom navigation, single column.

## 1. Information architecture

```text
Bottom tabs
├── Today      → daily todolist for local “today” + mini Activity strip
├── Catalog    → trainer exercises (guest OK)
├── Machines   → equipment photos (guest OK)
├── Plan       → workouts + schedule (auth)
└── You        → Google profile, full Activity heatmap, sign out
```

## 2. Guest → Athlete

1. Open app → **Today** shows teaser: “Sign in with Google to plan & use your daily todolist.”
2. Catalog/Machines fully usable.
3. Tap **Sign in with Google** (Today or You or locked Plan CTA).
4. Firebase Google popup/redirect → profile created → Today unlocks.

## 3. Create workout “Legs + shoulders” and schedule Saturday

```text
Plan tab
  → New workout
  → Name: "Legs + shoulders"
  → Add exercises (search/filter catalog list, multi-select)
  → Save
  → Schedule
  → Saturday → pick "Legs + shoulders"
  → Done
```

**Acceptance:** Saturday maps to that workout; other days unchanged.

### 3.1 Alternate: import trainer day

```text
Plan → Import trainer plan
  → Creates workouts from Day 1 / Day 2 / Day 3
  → Schedule weekdays in a simple picker
```

## 4. Daily todolist

```text
Today (Saturday)
  Header: "Legs + shoulders"
  Daily todolist:
    ☐ Leg press
    ☐ Leg curl
    …
  Tap row → ☑ + write log
  Tap again → ☐ + delete log
```

Optional later: note for weight used.

## 5. Activity

**You** tab (and compact strip on Today):

```text
Less ▢ ▢ ▢ ▢ More     (legend)
[grid of weeks × weekdays]
```

- Empty day: muted square  
- Partial / any todolist check: light green  
- Full scheduled workout: dark green  

Tap cell → sheet: date, workout name, checked count.

## 6. Screen inventory (v1)

| Screen | Auth | Primary actions |
| --- | --- | --- |
| Today | Mixed | Daily todolist, sign-in CTA |
| Catalog list + expand | No | Expand exercise, add-to-workout (auth) |
| Machines list + detail | No | Expand machine |
| Plan — workouts list | Yes | Create / open / delete workout |
| Plan — workout editor | Yes | Reorder, add/remove exercises |
| Plan — schedule | Yes | Schedule workout → weekday |
| You | Yes | Activity, account, sign out |
| Sign-in gate sheet | — | Google button |

## 7. Empty & error states

| State | Copy direction |
| --- | --- |
| No workout scheduled today | “Rest day — or schedule a workout in Plan.” |
| Workout has zero exercises | “Add exercises before your daily todolist helps.” |
| Sign-in cancelled | Stay on screen; no error toast spam |
| Offline write fail | “Couldn’t save — check connection.” |

## 8. Mobile UI rules (product)

- One primary CTA per screen.
- No desktop-style multi-pane planners on phone.
- Bottom nav always visible on primary tabs.
- Forms: full-width inputs, large list rows, avoid tiny icon-only destructive actions without confirm.
