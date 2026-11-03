# AGENTS.md

## Project Overview

**Feyz.li** — a static Next.js site that turns personal content (Airtable entries) into
published pages, served via Vercel.

Content is authored in an Airtable base and rendered into static pages at build time.
The Airtable base lives at:
<https://airtable.com/shrTIyJJFloiJ7Vwv/tblyXzwQCAWZlbl05>

## Commands

```bash
npm run dev          # start Next.js dev server
npm run build        # production build
npm run start        # serve production build
npm run lint         # run ESLint (eslint .)
npm run format       # format code with Prettier
npm run format:check # check formatting without writing
npm test             # run unit tests with Vitest (vitest run)
npm run import:bookmarks # import/sync HTML bookmarks to Airtable
```

> Note: this project uses **npm** (not yarn) — `package-lock.json` is the lockfile.
> `yarn` is not installed in this environment.

## Tech Stack

- **Framework:** Next.js 16 (App Router, `appDir` is stable)
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4, `react-wrap-balancer`, `clsx` + `tailwind-merge`
- **Testing:** Vitest 5 (`vitest.config.mts`)
- **Content source:** Airtable (REST API fetch — see `utils/airtable.ts`)
- **Analytics:** `@vercel/analytics` (`app/analytics.tsx`)
- **Utilities:** `luxon` (date/time handling), `slugify`, `sharp`
- **Deployment:** Vercel (`output: 'export'` commented out in `next.config.js`)

## Code Style

Enforced via ESLint (flat config `eslint.config.mjs`; `@next/next` + `typescript-eslint`, with
`react-hooks/exhaustive-deps` off) and Prettier (`.prettierrc.js`):

- No semicolons; single quotes; 2-space indent; print width 80; no trailing comma; double
  quotes only for JSX attributes where required.
- Tailwind class names are sorted by `prettier-plugin-tailwindcss` (registered via
  `plugins` in `.prettierrc.js`).
- Run `npm run format` to format code, `npm run format:check` to verify without writing.

## Directory Structure

```text
app/         # Next.js App Router pages, layouts, and route handlers
components/  # React components (default exports, lowercase/kebab-case filenames)
scripts/     # Bookmark importing & CLI parsing scripts (with unit tests)
types/       # TypeScript interfaces (e.g. AirtableRecord, AirtableAttachment)
utils/       # Helpers, constants, site SSOT metadata, data fetching
public/      # Static assets / manifest
```

Path alias: `@/*` maps to the repo root (e.g. `@/components/page`, `@/utils/const`).

## Conventions

- **Components:** default-exported function components (`Container`, `Feyz`, `AppHeader`,
  `AppFooter`, `AppNav`, `Page`, `Pagination`). Props typed via interfaces (`IContainer`,
  `IAppHeader`, `IAppFooter`) or dedicated props types. File names in `components/` are
  lowercase (`container.tsx`, `feyz.tsx`). React 19: import types from `react` directly
  (`import { HTMLAttributes, ReactNode } from 'react'`), not the `React` namespace.
- **Pages & Routes:** async server components in `app/**/page.tsx`; layouts in sibling
  `layout.tsx`. Dynamic route segments receive `params: Promise<{...}>` — destructure with
  `await params`. `generateStaticParams` receives plain `params` objects (not Promises).
  Dynamic metadata handled via `generateMetadata({ params })`. Metadata routes:
  `app/sitemap.ts` and `app/robots.ts`. Error handling: `app/not-found.tsx`.
- **Data & Configuration:** fetching lives in `utils/airtable.ts` (`getRecords`); shared
  constants in `utils/const.ts` (`DATA_PER_PAGE`); site metadata SSOT in `utils/site.ts`
  (`SITE_TITLE`, `SITE_DESCRIPTION`, `SITE_URL`, `SITE_TWITTER_HANDLE`, `SITE_LANGUAGE`);
  helpers in `utils/helper.ts` (`pageFill`) and `utils/find-feyz-by-slug.ts` (`findFeyzBySlug`);
  class merging via `utils/cx.ts` (`cx`).
- **Types:** shared interfaces in `types/airtable.ts` (`AirtableRecord`, `AirtableAttachment`).
  In `AirtableRecord`, `fields` properties are optional (`title?`, `tags?`, etc.)
  because Airtable API responses omit empty fields.
- **Testing:** Vitest unit tests placed alongside code as `*.test.ts`
  (`utils/site.test.ts`, `utils/helper.test.ts`, `utils/find-feyz-by-slug.test.ts`,
  `scripts/parse-bookmarks.test.ts`). Run via `npm test`.

## Content / Data Flow

- `getRecords({ pageSize, offset })` fetches Airtable content, sorted by `createdDate` desc,
  with `filterByFormula: draft=FALSE()` and `view: 'Grid view'`. Uses in-memory singleton promise
  caching across default calls and `cache: 'force-cache'` for build-time caching. Guarded by
  `MAX_PAGINATION_DEPTH = 50` and `FETCH_TIMEOUT_MS = 30000`. Configurable via `AIRTABLE_BASE_ID`
  and `AIRTABLE_TABLE_NAME`. If `AIRTABLE_API_KEY` is missing or fetch fails, warns and returns `[]`.
- Schema template is defined in `airtable-template.csv` with fields: `title`, `url`, `summary`,
  `source`, `tags` (with special `quote` behavior), `createdDate`, `image`, `draft`, `author`.
- Content pages and metadata routes export `export const revalidate = 21600` (6 hours).
- Dynamic tag routes live under `app/tag/[tag]/...` and `app/tag/[tag]/[page]/...`.
- Single post permalinks live under `app/feyz/[slug]/...`.

## Environment

- Requires `AIRTABLE_API_KEY` in a local `.env` file (gitignored). See `.env.example`.
- Optional Airtable overrides: `AIRTABLE_BASE_ID` (defaults to `appeqvrnUnbvHVDmH`) and
  `AIRTABLE_TABLE_NAME` (defaults to `content`).
- Optional site metadata overrides: `NEXT_PUBLIC_SITE_TITLE`, `NEXT_PUBLIC_SITE_DESCRIPTION`,
  `NEXT_PUBLIC_SITE_URL` (falls back to `VERCEL_PROJECT_PRODUCTION_URL`),
  `NEXT_PUBLIC_SITE_TWITTER_HANDLE`, `NEXT_PUBLIC_SITE_LANGUAGE`.
- Airtable images are served from `*.airtableusercontent.com` and `dl.airtable.com`
  (configured in `next.config.js` `images.remotePatterns`).

## Config Notes

- `next.config.js`: `images.remotePatterns` allows `*.airtableusercontent.com` and `dl.airtable.com`;
  `reactStrictMode: false`.
- `postcss.config.js`: uses `@tailwindcss/postcss` plugin for Tailwind v4.
- `app/globals.css`: `@import 'tailwindcss';` plus `@theme inline { ... }` font vars.
- `tailwind.config.js` deleted (Tailwind v4 config via CSS).
- `eslint.config.mjs`: flat config extending `@next/eslint-plugin-next` and `typescript-eslint`.
- `vitest.config.mts`: Vitest config with Node environment and `@` path alias.
