# Software Requirements Specification (SRS)

**Product:** Workoutland  
**Version:** 0.1.1-draft  
**Date:** 2026-09-26  
**Status:** Draft — requirements baseline for implementation  
**Vocab:** See [glossary.md](./glossary.md) — **Workout**, **Schedule**, **Daily todolist**, **Activity**  

---

## 1. Introduction

### 1.1 Purpose

This SRS defines functional and non-functional requirements for **Workoutland**, a mobile-first web application that helps a trainee:

1. Browse a curated exercise and machine catalog (from their trainer plan).
2. Sign in with Google.
3. Build named **workouts** and put them on a weekly **schedule**.
4. Work the **daily todolist** on Today (check off exercises).
5. See **Activity** — a GitHub-style green-square heatmap of consistency.

This document is the agreement baseline for design and implementation.

### 1.2 Scope

**In scope (v1)**

- Public (or signed-out) **exercise catalog** with form video, steps, cautions, machine links.
- Public **machines catalog** with real reference photos.
- **Google-only** authentication (Firebase Auth).
- Authenticated **workouts** (named groups of catalog exercises).
- **Schedule**: assign a workout to a weekday (e.g. Saturday → “Legs + shoulders”).
- **Daily todolist** on Today for the scheduled workout (checks write logs).
- **Activity** heatmap (green squares) driven by todolist completions.
- **Mobile-first UI** optimized for small phone displays (~360–430px width).

**Out of scope (v1)**

- Native iOS/Android store apps (mobile web / installable PWA may follow).
- Social feed, friends, sharing, coaches-as-tenants.
- Wearable / HealthKit / Google Fit sync.
- Payment / subscriptions.
- Email/password or phone auth.
- Custom user-uploaded exercise media (videos/photos).
- Multi-language UI.
- Offline-first sync with conflict resolution (basic cache OK).

### 1.3 Definitions

| Term | Meaning |
| --- | --- |
| **Catalog exercise** | Canonical exercise from the built-in trainer plan (id, steps, video, machine). |
| **Workout** | User-created named collection of catalog exercises (e.g. “Legs + shoulders”). Formerly “exercise set”. |
| **Schedule** | Mapping of a weekday (Mon–Sun) to at most one workout. |
| **Daily todolist** | Today’s checkable list of scheduled exercises — primary logging UX. |
| **Log** | Persisted completion behind a todolist check (`uid` + date + exerciseId). |
| **Activity** | Year (or rolling) green-square heatmap of todolist intensity. |
| **Machine** | Gym equipment entry with photo and setup cues. |

### 1.4 References

- Trainer source: `gym-plan.pdf` (3-day routine, 3×15, weight progression rule).
- Existing catalog implementation: `src/data/plan.ts`, `src/data/machines.ts`, `src/data/media.ts`.
- Firebase Auth (Google), Cloud Firestore (planned persistence).

### 1.5 Overview

Section 2 describes the product and constraints. Section 3 lists system features and numbered requirements. Section 4 covers interfaces. Section 5 covers quality attributes. Detail on data and flows lives in sibling docs.

---

## 2. Overall description

### 2.1 Product perspective

Workoutland is a standalone Next.js web app. Persistence and identity are provided by **Firebase** (Auth + Firestore). The exercise/machine catalogs are largely **static product data** shipped with the app; user plans and logs are **per-user** cloud data.

```text
┌─────────────┐     Google      ┌──────────────────┐
│ Phone browser│ ──────────────► │ Firebase Auth    │
│ Workoutland  │                 └────────┬─────────┘
│ (Next.js)    │                          │ uid
│              │     read/write           ▼
│              │ ◄───────────────── Cloud Firestore
│              │     static catalog
│              │ ◄──── app bundle (plan/machines/videos)
└─────────────┘
```

### 2.2 User classes

| Class | Description | Capabilities |
| --- | --- | --- |
| **Guest** | Not signed in | Browse catalog + machines |
| **Athlete** | Signed in with Google | All guest features + workouts, schedule, daily todolist, Activity |

v1 has a single authenticated role: **Athlete**.

### 2.3 Operating environment

- Modern mobile browsers (iOS Safari, Android Chrome) as primary.
- Desktop usable but layout is phone-first (single column, thumb-reachable controls).
- Network required for auth, plan sync, and video streaming.

### 2.4 Design constraints

- **Auth:** Google sign-in only.
- **Brand name:** Workoutland.
- **UI:** Mobile app interface metaphor (bottom nav, full-bleed cards, large tap targets ≥44px).
- **Catalog fidelity:** Trainer cues from `gym-plan.pdf` remain the source of form steps; HD demos are reference media.
- **Privacy:** User plans/logs are private to the signed-in Google account (`uid` isolation).

### 2.5 Assumptions and dependencies

- A Firebase project will be provisioned with Google provider enabled and Firestore rules enforcing `uid` ownership.
- Catalog exercise IDs remain stable (`leg-press`, etc.) so workouts can reference them.
- Asia/Dhaka is the default timezone for “today” and Activity day boundaries unless the user later gets a setting (v1: device local timezone).

### 2.6 Locked product decisions

| Topic | Decision |
| --- | --- |
| Product name | Workoutland |
| Sign-up / login | Google only (Firebase) |
| Display | Mobile-first, small screens |
| Catalog | Existing 3-day trainer catalog + machines |
| Planning | Create named **workouts** → pick exercises → **schedule** on a weekday |
| Logging UX | **Daily todolist** (check off exercises on Today) |
| Consistency viz | **Activity** — GitHub-like green squares |

### 2.7 Recommended defaults (see also open-decisions)

| Topic | Default for v1 SRS |
| --- | --- |
| Activity intensity | 0 = empty; any todolist check = light green; all scheduled exercises done = dark green |
| Schedule | One workout per weekday; empty weekday = rest / empty daily todolist |
| Seed content | Optional “import trainer 3-day plan” into Mon/Wed/Fri (or user picks days) |

---

## 3. System features

### 3.1 Feature: Authentication (Google)

**Description:** Athlete signs in and out with Google via Firebase Auth.

| ID | Requirement |
| --- | --- |
| AUTH-1 | The system shall support Google OAuth sign-in only (no email/password in v1). |
| AUTH-2 | The system shall persist session across reloads (Firebase Auth persistence). |
| AUTH-3 | The system shall provide sign-out from the profile/settings area. |
| AUTH-4 | Guest users shall access catalog routes without signing in. |
| AUTH-5 | Plan, daily todolist, and Activity data shall require an authenticated session. |
| AUTH-6 | On first successful Google sign-in, the system shall create a user profile document if missing. |

### 3.2 Feature: Exercise catalog

**Description:** Browse trainer exercises with form media and coaching copy.

| ID | Requirement |
| --- | --- |
| CAT-1 | The system shall present exercises grouped by the built-in trainer days (or equivalent filters). |
| CAT-2 | Expanding an exercise shall show a full-width HD form video (or best available demo). |
| CAT-3 | Expanding an exercise shall show prescription (sets×reps), tempo, why, steps, breathing, cautions, avoid/mistakes, tip, and machine link when available. |
| CAT-4 | Catalog content shall remain available to guests. |
| CAT-5 | From an exercise, the athlete may add it to a workout (auth required) with one clear action. |

### 3.3 Feature: Machines catalog

| ID | Requirement |
| --- | --- |
| MCH-1 | The system shall list machines used by the plan with clear reference photos. |
| MCH-2 | Each machine shall show how to find it, setup cues, and linked catalog exercises. |
| MCH-3 | Deep links from exercises to machines shall open the matching machine entry. |

### 3.4 Feature: Workouts (user-created)

**Description:** Athlete creates a named **workout** and picks catalog exercises into it.

**Example:** Create workout “Legs + shoulders”, pick leg press, leg curl, … side raise, etc.

| ID | Requirement |
| --- | --- |
| SET-1 | An authenticated user shall create a workout with a required name (1–60 chars). |
| SET-2 | An authenticated user shall add/remove catalog exercises to/from a workout. |
| SET-3 | Workout exercise order shall be user-controllable (reorder). |
| SET-4 | An authenticated user shall rename or delete a workout (delete confirms). |
| SET-5 | Workouts shall be private to the owning `uid`. |
| SET-6 | Creating a workout from a trainer day template shall be supported (copy exercises from Day 1/2/3). |
| SET-7 | Empty workouts are allowed but cannot be usefully scheduled until they contain ≥1 exercise (warn on schedule). |

### 3.5 Feature: Schedule (weekday → workout)

**Description:** Athlete schedules a workout on a weekday (e.g. Saturday → “Legs + shoulders”).

| ID | Requirement |
| --- | --- |
| DAY-1 | The system shall support scheduling at most one workout per weekday (Mon–Sun) per user. |
| DAY-2 | The athlete shall change or clear a weekday’s scheduled workout. |
| DAY-3 | “Today” shall resolve using the device’s local timezone. |
| DAY-4 | If today has a scheduled workout, the Today screen shall show that workout as the **daily todolist**. |
| DAY-5 | If today has no schedule, Today shall show rest / empty state with CTA to schedule or add ad-hoc todolist items (see LOG-6). |

### 3.6 Feature: Daily todolist

**Description:** Primary logging UX — a todolist of today’s scheduled exercises. Checking an item persists a log.

| ID | Requirement |
| --- | --- |
| LOG-1 | For a date with a scheduled workout, the system shall list each exercise as a checkable todolist item. |
| LOG-2 | Checking an item shall record a log entry for `{uid, date, exerciseId}` (idempotent toggle). |
| LOG-3 | Unchecking shall remove that log entry (or mark incomplete — prefer delete). |
| LOG-4 | Optional per-item note field (short text, e.g. weight used) — v1 nice-to-have; see open decisions. |
| LOG-5 | Completing all todolist items for the day shall be reflected as “full” intensity on Activity. |
| LOG-6 | Athlete may check at least one exercise on a rest day (ad-hoc todolist) so Activity can still turn light green. |
| LOG-7 | Todolist/log writes shall be allowed only for the owning user. |
| LOG-8 | UI copy shall prefer “Daily todolist” / “Today” over “log” or “checklist” in athlete-facing chrome. |

### 3.7 Feature: Activity (green-square heatmap)

**Description:** GitHub-style grid of green squares summarizing daily todolist consistency.

| ID | Requirement |
| --- | --- |
| HEAT-1 | The You tab (and a compact strip on Today) shall show an Activity calendar heatmap. |
| HEAT-2 | Default range: last ~52 weeks rolling. |
| HEAT-3 | Cell colors (v1 default): **none** = no checks; **level 1** = ≥1 todolist item done; **level 2** = all scheduled exercises for that weekday completed. |
| HEAT-4 | Tapping a cell shall show that day’s todolist summary (count / workout name). |
| HEAT-5 | Activity shall update when todolist checks change without full page reload. |
| HEAT-6 | Colorblind-safe: do not rely on green alone — use lightness steps and a legend. |

### 3.8 Feature: Mobile shell / navigation

| ID | Requirement |
| --- | --- |
| NAV-1 | Primary navigation shall be a bottom tab bar on small screens: **Today**, **Catalog**, **Machines**, **Plan**, **You** (names may vary slightly). |
| NAV-2 | Tap targets shall be ≥44×44px. |
| NAV-3 | Critical actions (todolist check, sign in) shall sit in thumb-friendly zones. |
| NAV-4 | Typography and spacing shall prioritize single-column readability (no dense multi-column dashboards on phone). |
| NAV-5 | Brand “Workoutland” shall appear as a strong identity mark on the Today/You header — not only as tiny nav text. |

### 3.9 Feature: Import trainer plan (optional accelerator)

| ID | Requirement |
| --- | --- |
| IMP-1 | Athlete may one-tap create three workouts from trainer Days 1–3. |
| IMP-2 | Athlete may schedule those workouts on chosen weekdays in a short setup flow. |

---

## 4. External interface requirements

### 4.1 User interfaces

- Mobile-first React UI (Next.js App Router).
- Visual language continues current Workoutland tokens (display + body fonts, accent, soft surfaces) adapted to denser mobile chrome.
- Dark Activity cells must remain legible on the light app background (or a dedicated You screen surface).

Detailed screens: [user-flows.md](./user-flows.md).

### 4.2 Hardware interfaces

None beyond a touch-capable phone browser.

### 4.3 Software interfaces

| System | Use |
| --- | --- |
| Firebase Authentication | Google identity, session |
| Cloud Firestore | Users, workouts, schedule, logs (todolist backs) |
| CDN video host | Form demo MP4s (existing catalog media URLs) |
| Next.js | App host, static catalog |

### 4.4 Communications

- HTTPS only.
- Firebase SDK over TLS.
- No custom backend required for v1 (client SDK + security rules). If server routes are added later (e.g. Admin), they remain non-goals for v1.

---

## 5. Non-functional requirements

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-1 | Performance | Daily todolist interactive in &lt;2s on mid-range 4G after auth (catalog video may stream progressively). |
| NFR-2 | Performance | Activity heatmap render for ~365 cells without jank on mid-range phones. |
| NFR-3 | Security | Firestore rules: `request.auth.uid == resource.data.uid` (or doc path under `/users/{uid}/...`). |
| NFR-4 | Security | No catalog/media secrets; Firebase config is public client config with locked rules. |
| NFR-5 | Privacy | No public profiles; logs/workouts not enumerable by other users. |
| NFR-6 | Reliability | Sign-in and todolist toggle failures show inline error; no silent data loss. |
| NFR-7 | Usability | Guest can understand value before sign-in (catalog); sign-in CTA when hitting Plan/Today write actions. |
| NFR-8 | Accessibility | Todolist rows reachable by screen reader; Activity has text alternative (summary counts). |
| NFR-9 | Maintainability | Catalog remains data modules; user data never mixed into static `plan.ts`. |
| NFR-10 | Localization | UI English only in v1; dates use locale-aware formatting. |

---

## 6. Data requirements

See [data-model.md](./data-model.md) for schemas. Product terms: [glossary.md](./glossary.md).

Summary entities:

- `users/{uid}` — profile
- `users/{uid}/workouts/{workoutId}` — workouts (Firestore path may keep `sets` during migration; product name is Workout)
- `users/{uid}/schedule` — weekday → workoutId
- `users/{uid}/logs/{yyyy-mm-dd}_{exerciseId}` — completions behind daily todolist checks

---

## 7. Acceptance criteria (v1 release)

1. Guest browses exercises + machines on a phone-width viewport.
2. Athlete signs in with Google and lands on Today.
3. Athlete creates workout “Legs + shoulders”, adds ≥3 catalog exercises, schedules it on Saturday.
4. On Saturday (or simulated date), Today shows that workout as a **daily todolist**.
5. Checking todolist items updates the **Activity** cell for that date (light → dark when all done).
6. Sign-out returns write features to locked/CTA state; catalog remains readable.

---

## 8. Document history

| Version | Date | Notes |
| --- | --- | --- |
| 0.1.1-draft | 2026-09-26 | Vocab: Workout, Schedule, Daily todolist, Activity ([glossary.md](./glossary.md)). |
| 0.1.0-draft | 2026-09-26 | Initial SRS from product conversation (catalog exists; auth/plans/logs not built). |
