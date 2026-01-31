# QuickQuote - Project Plan

A mini quote builder demonstrating Supabase, OpenAI, Stripe, and offline PWA capabilities.

---

## Goal

Build a proof-of-concept demonstrating seamless integration between Supabase, OpenAI, and Stripe - three tools increasingly used together in modern SaaS applications.

---

## Tech Stack

| Layer      | Technology              | Why                                  |
| ---------- | ----------------------- | ------------------------------------ |
| Framework  | Next.js (App Router)    | Industry standard, SSR + API routes  |
| Database   | Supabase (PostgreSQL)   | Auth + DB + Realtime in one          |
| Auth       | Supabase Auth           | Comes free with Supabase             |
| AI         | OpenAI API              | Best docs, cheap and fast            |
| Payments   | Stripe Checkout         | Industry standard, test mode is free |
| Styling    | Tailwind CSS            | Fast to build with                   |
| PWA        | Serwist (next-pwa fork) | Offline support for mobile users     |
| Deployment | Vercel                  | Free, instant deploys                |

---

## Database Schema (Supabase)

```sql
-- Users handled by Supabase Auth

create table quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  client_name text not null,
  client_email text,
  job_description text not null,
  line_items jsonb default '[]',
  total_cents integer default 0,
  status text default 'draft' check (status in ('draft', 'sent', 'paid')),
  stripe_session_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table quotes enable row level security;

create policy "Users can CRUD own quotes"
  on quotes for all
  using (auth.uid() = user_id);
```

---

## Features by Phase

### Phase 1: Foundation

- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Set up Supabase project (dashboard.supabase.com)
- [ ] Configure Supabase client in Next.js
- [ ] Implement auth (sign up, login, logout)
- [ ] Create quotes table with RLS policies
- [ ] Build basic quotes list page (dashboard)

**Checkpoint:** Can log in and see empty quotes dashboard.

---

### Phase 2: Core CRUD

- [ ] Create quote form (client name, email, job description)
- [ ] Save quotes to Supabase
- [ ] View single quote page
- [ ] Edit quote
- [ ] Delete quote

**Checkpoint:** Full CRUD working, data persists in Supabase.

---

### Phase 3: OpenAI Integration

- [ ] Set up OpenAI API key in environment
- [ ] Create API route: POST /api/ai/suggest
- [ ] Prompt: "Given this job description, suggest 3-5 line items with prices"
- [ ] Parse response into structured line items
- [ ] Add "Generate with AI" button to quote form
- [ ] Allow editing AI suggestions before saving

**Checkpoint:** Can describe "paint a 3-bedroom house" and get suggested line items.

---

### Phase 4: Stripe Integration

- [ ] Set up Stripe account (test mode)
- [ ] Install stripe package
- [ ] Create API route: POST /api/checkout
- [ ] Generate Stripe Checkout session from quote
- [ ] Add "Send to Client" button that generates payment link
- [ ] Create success/cancel pages
- [ ] Webhook to update quote status to "paid" (optional)

**Checkpoint:** Can generate a working Stripe payment link for any quote.

---

### Phase 5: PWA Offline Support

- [ ] Install and configure Serwist
- [ ] Add web manifest (icons, theme color)
- [ ] Configure service worker for caching
- [ ] Cache quotes list for offline viewing
- [ ] Show offline indicator in UI
- [ ] Queue new quotes when offline, sync when online (stretch)

**Checkpoint:** Can view quotes dashboard with airplane mode on.

---

## Out of Scope (Don't Build)

- Email sending (just generate the link)
- PDF generation
- Client portal / public quote view
- Real payment processing
- User settings / profile
- Multiple users / teams
- Comprehensive error handling
- Unit tests

---

## Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## File Structure

```
quickquote/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Landing / login
│   ├── dashboard/
│   │   └── page.tsx             # Quotes list
│   ├── quotes/
│   │   ├── new/
│   │   │   └── page.tsx         # Create quote
│   │   └── [id]/
│   │       └── page.tsx         # View/edit quote
│   ├── api/
│   │   ├── ai/
│   │   │   └── suggest/
│   │   │       └── route.ts     # OpenAI endpoint
│   │   └── checkout/
│   │       └── route.ts         # Stripe endpoint
│   └── success/
│       └── page.tsx             # Post-payment
├── components/
│   ├── AuthForm.tsx
│   ├── QuoteForm.tsx
│   ├── QuoteCard.tsx
│   ├── LineItemsEditor.tsx
│   └── OfflineIndicator.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client
│   ├── openai.ts
│   └── stripe.ts
├── public/
│   ├── manifest.json
│   └── icons/
└── types/
    └── index.ts                 # Quote, LineItem types
```

---

## Commands

```bash
# Create project
pnpx create-next-app@latest quickquote --typescript --tailwind --app --src-dir=false

# Install dependencies
pnpm install @supabase/supabase-js @supabase/ssr openai stripe serwist

# Run dev server
pnpm run dev

# Deploy
vercel
```

---

## Resources

- Supabase Docs: https://supabase.com/docs
- Supabase + Next.js Guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- OpenAI API Reference: https://platform.openai.com/docs/api-reference
- Stripe Checkout Quickstart: https://stripe.com/docs/checkout/quickstart
- Serwist (PWA): https://serwist.pages.dev/docs/next
