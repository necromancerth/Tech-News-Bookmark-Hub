# TechHub — Tech News & Bookmark Hub

A Next.js application for browsing Hacker News and bookmarking articles with notes and categories.

## Quick Start

1. Install: `npm install`
2. Setup env: `cp .env.example .env`
3. Init DB: `npx prisma generate && npx prisma db push`
4. Run: `npm run dev`

Open http://localhost:3000

## Pages
- `/` — News Feed (Top/New/Best from Hacker News)
- `/saved` — Saved bookmarks with search & filter
- `/categories` — Category manager (CRUD)

## Stack
- Next.js 15 App Router + TypeScript
- Prisma ORM + SQLite
- Zod validation (backend + frontend)
- TailwindCSS v4
- Hacker News API (no key needed)
