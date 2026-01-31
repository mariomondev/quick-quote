# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickQuote is a quote builder application demonstrating Supabase (auth + database), OpenAI (AI-powered line item suggestions), Stripe (payment links), and offline PWA capabilities. Built with Next.js 16 App Router.

## Commands

```bash
pnpm dev      # Start development server (localhost:3000)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **UI**: Tailwind CSS v4, shadcn/ui components (new-york style)
- **Theme**: next-themes with dark mode support
- **Forms**: react-hook-form with zod validation

### Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)
- `@/components/ui/*` - shadcn/ui primitives
- `@/lib/utils` - contains `cn()` helper for class merging
- `@/hooks/*` - custom React hooks

### Planned Integrations (see docs/plan.md)
- Supabase for auth and PostgreSQL database with RLS
- OpenAI API for AI-suggested line items
- Stripe Checkout for payment links
- Serwist for PWA offline support

## Component Conventions

UI components use shadcn/ui patterns:
- Components in `components/ui/` are primitives (Button, Input, Card, etc.)
- Use `cn()` from `@/lib/utils` for conditional class merging
- ThemeProvider wraps app in `app/layout.tsx`

## Performance Guidelines

This project includes Vercel's React best practices skill (`.agents/skills/vercel-react-best-practices/`). Key patterns to follow:

- **Async**: Use `Promise.all()` for parallel operations, move await into branches where used
- **Bundle**: Import directly from modules (avoid barrel files), use `next/dynamic` for heavy components
- **Server**: Use `React.cache()` for request deduplication, minimize data passed to client components
- **Re-renders**: Use functional setState, derive state during render (not effects), use refs for transient values
