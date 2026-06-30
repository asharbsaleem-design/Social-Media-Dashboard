# BIC social dashboard

A self-hosted, four-platform social analytics dashboard for TikTok, Instagram, LinkedIn, and YouTube. Built as a static site, no backend, no API keys, no login credentials involved anywhere. All data lives in your browser's local storage on whatever device you use it on.

## How it works

You read your numbers off each platform's own analytics screen (TikTok Studio, Instagram Insights, LinkedIn analytics, YouTube Studio) and type them into the Add data tab. The Overview tab shows all four platforms side by side with follower/view trend lines and your top post per platform.

## Hosting on GitHub Pages

1. Create a new repository (or use an existing one) and add these files: `index.html`, `style.css`, `app.js`.
2. Push to GitHub.
3. In the repo, go to Settings, then Pages.
4. Under Build and deployment, set Source to "Deploy from a branch," pick your main branch and the root folder.
5. Save. GitHub will give you a URL like `https://yourusername.github.io/repo-name/` within a minute or two.

## Loading your existing data

`starter-data.json` contains the TikTok, Instagram, and YouTube baseline numbers already logged as of June 29, 2026. Once the site is live:

1. Go to the Overview tab.
2. Click "Import data."
3. Select `starter-data.json`.

Your three platforms will populate immediately. LinkedIn is left empty since it wasn't logged yet.

## Important notes on data persistence

This uses `localStorage`, which is tied to the specific browser and device you're using. That means:

- Data does not sync between your phone and laptop automatically.
- Clearing your browser's site data or cache will erase it.
- Using a different browser on the same computer will show an empty dashboard.

Use the "Export data" button regularly to download a JSON backup. If you want this to sync across devices down the line, that would need a small backend (or a service like Firebase) added on top of this, which is a separate build.

## Editing weekly cadence

The "Views" and "Engagements" fields are meant to represent the period since your last entry, not lifetime totals. Try to check the same reporting window each time (e.g. always "last 7 days" or always "last 28/30 days") so the trend lines stay meaningful. Mixing lifetime and periodic numbers will distort the trend line.

## Files

- `index.html` — page structure
- `style.css` — BIC navy/gold styling with platform-true accent colors per card
- `app.js` — all logic: storage, charts, form handling, export/import
- `starter-data.json` — your existing logged baselines, ready to import
