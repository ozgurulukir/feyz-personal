# AGENTS.md

## Project Overview

**Feyz.li** — a static Next.js site that turns personal content (Airtable entries) into
published pages, served via Vercel.

Content is authored in an Airtable base and rendered into static pages at build time.
The Airtable base lives at:
https://airtable.com/shrTIyJJFloiJ7Vwv/tblyXzwQCAWZlbl05

## Commands

```bash
npm dev      # start Next.js dev server
npm build    # production build
npm start    # serve production build
npm lint     # run ESLint (eslint .)
npm format        # format code with Prettier
npm format:check # check formatting without writing
```

> Note: this project uses **npm** (not yarn) — `package-lock.json` is the lockfile.
> `yarn` is not installed in this environment.

## Tech Stack

- **Framework:** Next.js 16 (App Router, `appDir` is stable; no longer experimental)
- **UI:** React 19, TypeScript (strict), Tailwind CSS v4, `react-wrap-balancer`, `clsx` + `tailwind-merge`
- **Content source:** Airtable (REST API fetch — see `utils/airtable.ts`)
- **Deployment:** Vercel (`output: 'export'` commented out in `next.config.js`)

## Code Style

Enforced via ESLint (flat config `eslint.config.mjs`; `next/core-web-vitals`, with
`react-hooks/exhaustive-deps` off) and Prettier (`.prettierrc.js`):

- No semicolons; single quotes; 2-space indent; print width 80; no trailing comma; double
  quotes only for JSX attributes where required.
- Tailwind class names are sorted by `prettier-plugin-tailwindcss` (registered via
  `plugins` in `.prettierrc.js`).
- Run `npm run format` to format code, `npm run format:check` to verify without writing.

## Directory Structure

```
app/         # Next.js App Router pages & layouts (route folders)
components/ # React components (default exports, PascalCase files)
types/      # TypeScript interfaces (e.g. AirtableRecord)
utils/      # Helpers, constants, data fetching
public/     # Static assets / manifest
```

Path alias: `@/*` maps to the repo root (e.g. `@/components/page`, `@/utils/const`).

## Conventions

- **Components:** default-exported function components, props typed via interfaces
  prefixed with `I` (e.g. `IAppHeader`, `IContainer`). File names in `components/` are
  PascalCase (`feyz.tsx`, `container.tsx`). React 19: import types from `react` directly
  (`import { HTMLAttributes, ReactNode } from 'react'`), not the `React` namespace.
- **Pages:** async server components in `app/**/page.tsx`; layouts in sibling `layout.tsx`.
  Dynamic route segments receive `params: Promise<{...}>` — destructure with `await params`.
  `generateStaticParams` receives plain `params` objects (not Promises).
- **Data:** fetching lives in `utils/airtable.ts` (`getRecords`); shared constants in
  `utils/const.ts` (e.g. `DATA_PER_PAGE`); helpers in `utils/helper.ts`; class merging via
  `utils/cx.ts` (`cx`).
- **Types:** shared interfaces in `types/` (e.g. `AirtableRecord`).

## Content / Data Flow

- `getRecords({ pageSize, offset })` fetches Airtable content, sorted by `createdDate` desc,
  with `filterByFormula: draft=FALSE()`. Uses `cache: 'force-cache'` for build-time caching
  (Next 15+ defaults fetch to no-store).
- Content pages export `export const revalidate = 21600` (6 hours).
- Dynamic tag routes live under `app/tag/[tag]/...`.

## Environment

- Requires `AIRTABLE_API_KEY` in a local `.env` file (gitignored).
- Airtable images are served from `v5.airtableusercontent.com` (configured in
  `next.config.js` `images.remotePatterns`).

## Config Notes

- `next.config.js`: `images.remotePatterns` replaces deprecated `images.domains`; `appDir`
  removed (stable in Next 16).
- `postcss.config.js`: uses `@tailwindcss/postcss` plugin for Tailwind v4.
- `app/globals.css`: `@import 'tailwindcss';` plus `@theme inline { ... }` font vars.
- `tailwind.config.js` deleted (Tailwind v4 config via CSS).
- `eslint.config.mjs`: flat config extending `@next/eslint-plugin-next` and `typescript-eslint`.
