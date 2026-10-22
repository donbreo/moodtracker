# Stillday Journal

Stillday is a private, local-first daily mood and wellbeing journal. Use it to record a brief check-in, keep a separate free-form journal, and look back at recent trends. It is a personal self-tracking tool, not a diagnostic or medical application.

## Features

- Daily check-ins for emotional, cognitive, physical, social, coping, sleep, and daily-context measures
- A separate Markdown-compatible journal field, plus optional notes about important events
- Date-based entries that can be revisited and edited
- A review-progress indicator and validation before saving
- A dashboard with the selected day's mood, energy, stress, and focus; 7-day averages; and a mood trend when enough check-ins are available
- Local browser storage, plus JSON backup download, export, and import
- A YAML-frontmatter Markdown serializer/parser as a foundation for future file-based storage

## Getting started

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite in your browser. To create a production build:

```sh
npm run build
```

## Using the journal

1. Choose the entry date. The current date is selected by default.
2. Review or adjust the metrics and add any context, event notes, or journal text you want to keep.
3. Select **Save check-in**. The entry is validated and saved in this browser, and a JSON backup of all saved entries is downloaded.
4. Use **Export** to download another backup at any time. Use **Import** to restore a JSON backup.

Import replaces the journal's current saved entries with the entries in the selected backup. Keep a separate copy of backups somewhere safe. Clearing this browser's local storage can remove the locally saved journal.

## Privacy and storage

Journal entries are stored in the browser's `localStorage` under the versioned key `mood-journal:v1`. The app does not require an account or backend, and does not send journal content to an external service. The downloaded JSON backups are portable files containing your journal data; store and share them with care.

The storage layer is behind a `JournalStore` interface, so a future Markdown-backed store can be added without coupling persistence directly to the UI. The Markdown adapter is implemented separately, but the current app uses browser storage and JSON backup files rather than reading or writing daily Markdown files.

## Data and validation

Each entry is keyed by an ISO date and contains:

- Mood: overall mood, positive and negative affect, stress, anxiety, irritability, loneliness, and calmness
- Cognition: energy, focus, motivation, and mental fatigue
- Physical state: wellbeing, pain, and tiredness
- Social connection and satisfaction
- Challenge handling
- Sleep duration, quality, and restedness
- Day type, activity, location, and social context
- Best, worst, and other event notes, with optional mood impact
- A separate free-form journal body

Metric values are validated before saving. Most scales are 1–10; pain is 0–10, event impact is -5 to +5, and sleep duration is 0–24 hours.

The Markdown adapter serializes structured metadata as YAML frontmatter and keeps the journal body after it. Parsing fills absent optional metadata from defaults and reports invalid Markdown/frontmatter rather than silently overwriting data.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project builds and create the production bundle |
| `npm run test` | Run the Vitest test suite |
| `npm run typecheck` | Run the TypeScript project checks |
| `npm run lint` | Lint the project with ESLint |

## Project layout

```text
src/
├── components/       # Check-in and dashboard UI
├── lib/
│   ├── analytics/    # Pure calculations and trend helpers
│   ├── markdown/     # YAML-frontmatter serialization and parsing
│   ├── storage/      # Local storage and JSON backup import/export
│   ├── date.ts       # Date helpers
│   ├── defaults.ts   # New-entry defaults
│   └── validation.ts # Entry validation
├── types/            # Shared journal and storage interfaces
├── App.tsx
└── main.tsx
```

## Current scope

Stillday is a frontend-only first version. It has no accounts, backend, cloud sync, or AI features. Direct Markdown file persistence and browser-extension integration are future possibilities, not current features.
