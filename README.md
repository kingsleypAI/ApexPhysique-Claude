# FORGE — GitHub Pages edition

This is a modular static-site version of the supplied FORGE app. It remains compatible with GitHub Pages and uses relative asset paths so it can be hosted at either a user site or a project site.

## Deploy
1. Download and extract `FORGE-GitHub-Pages.zip`.
2. In your GitHub repository, upload the **contents** of this folder (not the enclosing folder) to the repository root, keeping all uploaded files together in the repository root.
3. Commit to your Pages publishing branch.
4. In GitHub: Settings → Pages, select the correct branch and root folder (or your existing `/docs` publishing folder).
5. Open the published site, export a FORGE backup, then test workouts, nutrition, restore and offline mode.
6. On mobile, open the site in your browser and choose Add to Home Screen / Install App.

## Important data notes
- Existing `localStorage` keys are preserved; the app is still client-side. Data is browser/device-specific and is not automatically synchronised between devices.
- Export a backup before switching the live site. Restore it on the same origin if the site origin changes (scheme, host or port); changing only the repository path does not create a new localStorage origin.
- Backups now include all keys beginning `apx_` or `forge_`, including new set logs. Imports only restore those app-owned keys and ask for confirmation.
- All navigation and workout icons are now native emoji/text glyphs, so they do not depend on an icon CDN. Google Fonts remain optional; system font fallbacks are used offline.
- Offline app shell caching is provided by `sw.js`; first visit requires an internet connection.

## Structure
- `index.html` — app shell and existing markup
- `app.css` — original styles plus new responsive components
- `00-core.js` — local date and safe parsing helpers
- `01-30-*.js` — original scripts separated into ordered files
- `31-forge-enhancements.js` — set logging, weekly insights, achievements and drift-resistant timers
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — PWA files

## Validation
The JavaScript files are intended to load as ordered classic scripts, not ES modules, because the existing app uses shared global functions and state. Do not add `type="module"` to these script tags without a deliberate refactor.
