# Open decisions

Items not fully locked in conversation. **Defaults below are assumed by the SRS** until overridden.

| ID | Question | SRS default | Alternatives |
| --- | --- | --- | --- |
| OD-1 | Activity intensity rule | 0 / any todolist check / full scheduled workout | Any-check-only; full-workout-only |
| OD-2 | Rest-day todolist | Allow ad-hoc exercise checks (light green) | Disallow checks unless weekday scheduled |
| OD-3 | Timezone | Device local | Force `Asia/Dhaka` |
| OD-4 | Per-exercise weight note | Deferred (optional LOG-4) | Ship in v1 |
| OD-5 | Trainer import weekdays | User picks days in setup | Auto Mon/Wed/Fri |
| OD-6 | PWA install prompt | Deferred | Ship with manifest + icons in v1 |
| OD-7 | Firebase project | To be created by owner | — |
| OD-8 | Auth UX | Redirect vs popup | Prefer popup on Android Chrome, redirect on iOS if needed |
| OD-9 | Pull-over demo mismatch | Keep closest HD video + catalog text | Record/host dedicated clip later |
| OD-10 | Soft limits | 40 exercises/workout, 30 workouts/user | Raise if needed |

## Resolved (do not reopen without version bump)

| Topic | Decision |
| --- | --- |
| Product name | Workoutland |
| Auth providers | Google only |
| Form factor | Mobile-first small display |
| Named exercise group | **Workout** (not “exercise set”) |
| Weekday mapping | **Schedule** |
| Logging UX | **Daily todolist** on Today |
| Consistency viz | **Activity** (green squares) |
| Core loop | Workout → Schedule → Daily todolist → Activity |
