# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: online game platform where players compete for points. Early stage (scaffold from Create Next App; only `app/layout.tsx`, `app/page.tsx`, `app/globals.css` exist). The README says the project follows spec-driven development (`/spec` and `/spec-impl` skills from `Klerith/fernando-skills`, installed with `npx skills@latest add Klerith/fernando-skills`).

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)
- No test runner is configured yet.

## Stack and caveats

- Next.js 16.4.6, React 19.3.0, TypeScript, Tailwind CSS 4 (via `@tailwindcss/turbopack`), App Router (`app/`).
- This Next.js version has breaking changes versus common training data. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) and heed deprecation notices. This rule comes from `AGENTS.md`, which `next dev` re-creates automatically.
