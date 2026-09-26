# Workoutland — Documentation

Product docs for the Workoutland mobile-first gym companion.

| Doc | Purpose |
| --- | --- |
| [SRS](./srs/SRS.md) | Software Requirements Specification (authoritative) |
| [Glossary](./srs/glossary.md) | Product vocabulary (Workout, Schedule, Daily todolist, Activity) |
| [Data model](./srs/data-model.md) | Firestore collections & entity relationships |
| [User flows](./srs/user-flows.md) | Primary screens and flows on small displays |
| [Open decisions](./srs/open-decisions.md) | Defaults vs still-open product choices |

**Product name:** Workoutland  
**Platform target:** Mobile web / PWA-style UI (small display first)  
**Auth:** Google sign-in via Firebase Authentication  
**Core loop:** Workout → Schedule → Daily todolist → Activity  
**Status:** Requirements (implementation not started for auth/plans/todolist)
