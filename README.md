# FORGE — Physique Recomposition Tracker

A fully self-contained mobile web app for an ongoing body recomposition programme. Started as a 12-week plan, now open-ended. Built to be used at the gym, saved to the Android home screen, and run entirely without an account or internet connection after first load.

**Live app:** `https://kingsleypai.github.io/ApexPhysique-Claude`

The app has been renamed twice during development — originally **Ascend**, then **ApexPhysique**, now **Forge**. Internal localStorage keys were kept stable across renames so no data was ever lost.

---

## What's Inside

### 5 Sections (hamburger menu)

| Section | What it does |
|---|---|
| **Home** | Today's workout card with a direct link into Workouts, a weekly calendar strip (expandable into a full month view) showing trained/rest days, a weight-trend sparkline and body stats built live from real check-in history, a check-in countdown banner, water and cardio tracking cards, TDEE/calorie-deficit summary, Mind & Body card (Low Motivation / I'm Ill / Feeling Good modes), and a "More ▾" accordion holding PRs, Rules, Supplements, Physique Targets, and What To Expect |
| **Workouts** | Push/Pull/Legs split, each day further split into an A/B variant that alternates week to week to keep session volume reasonable, plus a Post-Session Cardio (20 min, Zone 2) card on every day. Open-ended phase system (Foundation → Strength → Definition, cycling every 6 weeks indefinitely — no fixed end date), Today Only / Full Programme / 30-Min Superset view toggles, per-exercise weight logging with PRs and sparklines (tap an empty weight field to auto-fill your last logged weight), weight stepper buttons (±2.5kg), exercise checklist ticks with daily auto-reset, a sticky rest timer bar with expandable duration presets (auto-starts on tick, skips re-starting on the session's final exercise, screen wake lock while running, audio + notification on completion), session notes per day |
| **Cut Meal Plan** | Real macro and calorie targets (verified against actual logged intake, not just a theoretical plan), a short explanation of the current deficit and trade-offs, and swappable meal options grouped by slot (breakfast/lunch/after-work) so you're not stuck eating the same thing daily |
| **Recipes** | Tap-to-expand recipe cards with ingredients and step-by-step instructions for every meal in the Cut Meal Plan, plus a Sunday prep guide and kitchen-basics tips |
| **Shopping List** | Weekly shopping list (Food / Supplements toggle) with checkboxes, live progress bar, and quantities scaled to the real weekly meal plan |

Earlier versions of this app had separate Calories, Progress, Body Tracking, What's Next, and Strava sections in the main menu. These were removed since they went unused — per-exercise weight logging and PR tracking still live inside Workouts, pull-up/muscle-up progression lives in the Home screen's "More ▾" accordion and inside the Workouts tab's exercise tips, and real check-in data drives the Home screen directly instead of a separate tracking tab.

---

## Programme Overview

**Split:** Push / Pull / Legs × 2 per week (Mon/Fri Push, Tue/Sat Pull, Wed/Sun Legs, Thu rest)

**Open-ended phases** (no fixed 12-week end date — cycles indefinitely):
- **Foundation** (weeks 1–2 of each cycle) — form and base volume
- **Strength** (weeks 3–4 of each cycle) — heavier loads, lower reps
- **Definition** (weeks 5–6 of each cycle) — reveal the work, stay lean

**Goal:** 120kg pre-tracking → 102.0kg at the first logged Gym Group check-in (14 Jul 2026) → targeting **85kg / ~13% body fat** (revised down from an original 10% target after discussing realistic recomposition outcomes) — genuinely lean with visible vascularity, athletic build. Progress is tracked live on the home screen from real check-in receipts, not hardcoded milestones, so this file won't show the current number — open the app for that.

**31 exercise/cardio cards** across Push (11, each day split A/B), Pull (11, each day split A/B), and Legs (9, each day split A/B), including a Post-Session Cardio card on every day and forearm/grip work (Wrist Curl, Reverse Barbell Curl, Dead Hang, Plate Pinch Hold) spread across the whole week — each lift has its own YouTube Short demonstrating correct form, individually verified and re-sourced when links went stale.

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

Everything is stored locally in the browser's `localStorage` — nothing is sent to any server. Strava and Open Food Facts integrations that existed in earlier versions have since been removed. Tracked locally:

- Exercise weight logs and PRs (per exercise)
- Daily exercise checklist completion (auto-resets each day)
- Check-in history (weight, body fat %) — logged from real Gym Group receipts
- Weight-tracking data bridged into the home screen's trend chart
- Water intake, cardio sessions
- Session notes per workout day
- Mind & Body mode preference
- 30-Min mode preference, workout view preference, calendar view preference
- Day-swap overrides (when a rest day is manually moved)
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
- **Weekly calendar strip** — compact 7-day view by default (replacing an earlier full-month grid that took up too much screen space), colour-coded by Push/Pull/Legs/Rest, with a "see full month" option to expand when needed
- **Progressive overload prompts** — logging a new PR or matching a previous best surfaces a toast with the next target
- **Mind & Body card** — contextual support content for low motivation or illness, including real data from past rest weeks
- **Data export/import** — JSON backup and restore, added after realizing browser storage has no built-in protection against accidental clearing

---

## Built With

- Vanilla HTML / CSS / JavaScript — zero frameworks, zero build step, zero dependencies
- Google Fonts (Space Grotesk + DM Sans)
- Font Awesome for icons (replaced an earlier attempt using Google's Material Symbols, which failed to render on the real device it was built for)
- YouTube for exercise video demonstrations (tap-to-open, native app scheme with browser fallback)
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
