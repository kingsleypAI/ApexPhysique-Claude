# FORGE — Physique Recomposition Tracker

A fully self-contained mobile web app for an ongoing body recomposition programme. Started as a 12-week plan, now open-ended. Built to be used at the gym, saved to the Android home screen, and run entirely without an account or internet connection after first load.

**Live app:** `https://kingsleypai.github.io/ApexPhysique-Claude`

The app has been renamed twice during development — originally **Ascend**, then **ApexPhysique**, now **Forge**. Internal localStorage keys were kept stable across renames so no data was ever lost.

---

## What's Inside

### 10 Sections (hamburger menu)

| Section | What it does |
|---|---|
| **Home** | Unified calendar card (today's workout + monthly session grid + log button), compact stats strip (weight, body fat %, sessions, streak, target), TDEE card, Mind & Body card (Low Motivation / I'm Ill / Feeling Good modes), and a "More ▾" accordion holding PRs, Rules, Supplements, Physique Targets, and What To Expect |
| **Workouts** | Push/Pull/Legs split, open-ended phase system (Foundation → Strength → Definition, cycling every 6 weeks indefinitely — no fixed end date), Today Only / Full Programme / 30-Min Superset view toggles, per-exercise weight logging with PRs and sparklines, weight stepper buttons (±2.5kg), exercise checklist ticks with daily auto-reset, mini rest timer per day (auto-starts on tick, screen wake lock while running, audio + notification on completion), session notes per day |
| **Calories** | Food search and barcode scanner (Open Food Facts), daily calorie and macro tracking |
| **Progress** | Monthly session calendar, 12-week-style training overview, exercise PRs grid with sparklines, benchmarks |
| **Body Tracking** | Weight chart, strength log with PR tracking, body measurements, weekly notes, fortnightly check-in reminders with milestone tracking (sub-100kg, 95kg, 90kg, 85kg goal) |
| **Nutrition** | Macro targets, recomposition strategy explanation, AM/PM meal plans |
| **Recipes** | Beginner-friendly recipes with step-by-step instructions, Sunday meal prep guide |
| **Shopping List** | Weekly shopping list (food + supplements) with checkboxes and progress bar |
| **What's Next** | Post-programme goals: pull-up/muscle-up progression, vascularity targets, long-term maintenance |
| **Strava** | OAuth connection, activity sync |

---

## Programme Overview

**Split:** Push / Pull / Legs × 2 per week (Mon/Fri Push, Tue/Sat Pull, Wed/Sun Legs, Thu rest)

**Open-ended phases** (no fixed 12-week end date — cycles indefinitely):
- **Foundation** (weeks 1–2 of each cycle) — form and base volume
- **Strength** (weeks 3–4 of each cycle) — heavier loads, lower reps
- **Definition** (weeks 5–6 of each cycle) — reveal the work, stay lean

**Goal:** Started at 110kg, targeting **85kg / ~10% body fat** — genuinely lean with visible vascularity, athletic build. Milestones tracked at 99kg, 95kg, 90kg, and the 85kg goal.

**26 exercises** across Push (8), Pull (11, including 3 dedicated forearm/grip exercises for vascularity), and Legs (7) — each with its own YouTube Short demonstrating correct form, individually verified and re-sourced when links went stale.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app — all HTML, CSS, and JavaScript in one file |
| `sw.js` | Service worker — network-first caching for `index.html` so live updates are picked up immediately, cache-first for static assets (icons, manifest) |
| `manifest.json` | Web app manifest — name, icons, theme colour for home screen install (relative paths, survives repo renames) |
| `icon-192.png` / `icon-512.png` | App icon — bold chunky "F" on black, red accent mark |

---

## Installing on Android

1. Open `https://kingsleypai.github.io/ApexPhysique-Claude` in Chrome
2. Tap the three-dot menu → **Install app** (or wait for the install banner)
3. The FORGE icon appears on your home screen
4. Opens full screen with no browser bar

If you're updating from an older install and something looks stale, uninstall and reinstall — the service worker cache version bumps with major changes.

---

## Data & Privacy

Everything is stored locally in the browser's `localStorage` — nothing is sent to any server except Strava (if connected) and Open Food Facts (public, anonymous food lookups). Tracked locally:

- Exercise weight logs and PRs (per exercise)
- Daily exercise checklist completion (auto-resets each day)
- Fortnightly check-in history (weight, body fat %)
- Body tracking: weight chart, measurements, notes
- Calorie/macro logs, water intake, cardio sessions
- Session notes per workout day
- Mind & Body mode preference
- 30-Min mode preference, workout view preference
- Shopping list checkboxes, meal plan preferences

**Data Backup:** Home → More → Data Backup has Export JSON / Import JSON buttons — download a full backup of all tracked data, or restore from a previous export. Worth doing regularly since clearing browser data wipes everything.

Data is tied to the browser/device — opening on a different device starts fresh unless you import a backup.

---

## Key Features Added Since Launch

- **Custom colour theme** — settled on red (`#C8102E`) accent on black after testing chalk white, electric lime, and muted sage green
- **Open-ended phase system** — replaced the fixed 12-week countdown with indefinite cycling once the user passed week 12 in real life
- **TDEE recalculated** — adjusted from "very active" (daily walking commute) to "moderately active" (car commute) with updated calorie targets
- **Weight steppers** — ±2.5kg tap buttons next to every exercise's weight input for fast gym-floor logging
- **Auto-start rest timer** — starts automatically when a set is ticked complete, includes screen wake lock so the phone doesn't sleep between sets
- **Monthly session calendar** — colour-coded by Push/Pull/Legs/Rest, replacing a static week grid
- **Progressive overload prompts** — logging a new PR or matching a previous best surfaces a toast with the next target
- **Mind & Body card** — contextual support content for low motivation or illness, including real data from past rest weeks
- **Data export/import** — JSON backup and restore, added after realizing browser storage has no built-in protection against accidental clearing

---

## Built With

- Vanilla HTML / CSS / JavaScript — zero frameworks, zero build step, zero dependencies
- Google Fonts (Space Grotesk + DM Sans)
- YouTube for exercise video demonstrations (tap-to-open, native app scheme with browser fallback)
- Open Food Facts API for food search and barcode scanning
- Strava API (OAuth) for activity sync
- localStorage for all persistent data
- PWA manifest + service worker for home screen install

---

## Updating the App

1. Upload the changed file(s) to the GitHub repository via the web editor (restricted PC environment — no local git tooling)
2. GitHub Pages updates within ~60 seconds
3. Reload in Chrome on your phone — the network-first service worker picks up the change immediately without needing a hard refresh

---

## Development Notes

This app has been built and iterated entirely through conversation with Claude across many sessions. A few hard-won lessons baked into the current build:

- **Real browser testing catches what static checks miss.** A rendering bug where a `<div id="tab-program">` tag got corrupted into plain text was invisible to Node syntax checks and passed every automated test — it only showed up when the actual page was loaded in headless Chromium and the DOM was queried directly.
- **`file://` testing is not representative.** Opening the HTML file directly (not via the live GitHub Pages URL) breaks `localStorage`, service workers, and absolute paths in ways that don't reflect real-world behaviour.
- **Exercise diagrams: video beats hand-drawn art.** Several attempts at custom SVG stick-figure diagrams for exercise form all produced anatomically confusing results. Real YouTube Shorts, individually sourced and verified, work better.
- **Verify claims before fixing them.** External code reviews (including AI-generated ones) sometimes report issues that don't actually exist in the current file, or miss the real root cause behind a symptom. Each review is checked against the live file before any change is made.

---

*Built with Claude — Anthropic*
