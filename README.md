# CGLAB — AI-Generated Reels, Crafted by Humans

A productized AI media agency client portal. Clients submit briefs, the CGLAB team handles ideation → AI generation → editing, and delivers finished reels through the same portal.

Built with **Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion · Prisma · NextAuth · Google Drive links**. Designed in a strict monochrome, ultra-premium aesthetic.

---

## ✨ Features

### Public
- **Landing page** — cinematic hero with showreel placeholder, manifesto, 3-step "How It Works", 3-tier pricing, FAQ accordion, footer.
- **Authentication** — login + signup with credentials, JWT sessions, role-based access (CLIENT / ADMIN).

### Client Portal (`/dashboard`, `/new-order`)
- Dashboard with stats overview, active-orders table, delivered-files grid with download buttons.
- 6-step briefing wizard with flawless Framer Motion transitions: Brand & Industry → Objective → Style → Audience & Message → References → Deadline.
- Live order summary on the final step. State preservation when navigating back.

### Admin Console (`/admin`)
- Operations dashboard with per-stage pipeline counts and all-orders table.
- Status filter chips + search across order #, brand, client, industry.
- Slide-in order detail drawer with full brief breakdown, status pipeline visualization, "Advance to next" + "Skip to" controls.
- Premium delivery-link attacher — admin pastes a Google Drive (or any URL) share link.
- Forward-only status transitions enforced server-side + full audit trail (`OrderStatusUpdate` records).

---

## 🚀 Quick Start (Local)

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
# (defaults work for local SQLite — no changes needed)

# 3. Push the database schema
bun run db:push

# 4. Seed demo data (admin + client accounts + sample orders)
bun run db:seed

# 5. Start the dev server
bun run dev
```

Open `http://localhost:3000`.

### Demo accounts

| Role   | Email                      | Password              |
|--------|----------------------------|-----------------------|
| Admin  | admin@cglab.studio       | cglab-admin-2026    |
| Client | client@cglab.studio      | cglab-client-2026   |

---

## 🌐 Production Deployment (Vercel + Neon + GitHub)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: CGLAB productized service portal"
git branch -M main
git remote add origin https://github.com/hossyehiaa/CGLAB.git
git push -u origin main
```

### Step 2 — Create a Neon PostgreSQL database

1. Go to **https://neon.tech** → Sign in with GitHub.
2. Create a new project (e.g. `cglab`).
3. Copy the **pooled connection string** — it looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3 — (Skipped) File storage via Google Drive

CGLAB uses **Google Drive share links** for final reel delivery instead of hosting files. The admin pastes a Drive URL into the order drawer. No storage configuration needed — skip this step.

### Step 4 — Switch Prisma to PostgreSQL

Edit `prisma/schema.prisma` — change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"  // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Then push the schema to Neon:

```bash
bun run db:push
bun run db:seed   # re-seeds the production DB with admin + demo client + sample orders
```

### Step 5 — Import to Vercel

1. Go to **https://vercel.com/new** → Import the `hossyehiaa/CGLAB` repo.
2. Vercel auto-detects Next.js — accept the defaults.
3. Add the following **Environment Variables** (Project Settings → Environment Variables):

   | Key                      | Value                                                                   |
   |--------------------------|-------------------------------------------------------------------------|
   | `DATABASE_URL`           | `postgresql://...neon.tech/neondb?sslmode=require` (from Step 2)        |
   | `NEXTAUTH_SECRET`        | Run `openssl rand -base64 32` locally and paste the output              |
   | `NEXTAUTH_URL`           | `https://your-project.vercel.app` (your Vercel URL — add after deploy)  |
   | `BLOB_READ_WRITE_TOKEN`  | The token from Step 3                                                   |

4. Click **Deploy**.

### Step 6 — Post-deploy

1. After the first successful deploy, copy your production URL (e.g. `https://cglab-xxx.vercel.app`).
2. Update the `NEXTAUTH_URL` env var in Vercel to that URL.
3. Trigger a redeploy (Deployments → ⋮ → Redeploy).
4. Visit the production URL, log in with `admin@cglab.studio / cglab-admin-2026`, and change the admin password by replacing the seeded user via Prisma Studio or a quick script:

   ```bash
   bunx prisma studio
   # Or hash a new password and update directly:
   bunx tsx -e "import bcrypt from 'bcryptjs'; import {PrismaClient} from '@prisma/client'; const db=new PrismaClient(); db.user.update({where:{email:'admin@cglab.studio'},data:{password:await bcrypt.hash('YOUR_NEW_PASSWORD',12)}}).then(()=>process.exit(0))"
   ```

---

## 🏗 Architecture

```
src/
├── app/
│   ├── (auth)/                # Login + Signup pages
│   ├── (dashboard)/           # Client portal (dashboard + new-order)
│   ├── (admin)/               # Admin console
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth route handler
│   │   ├── auth/signup/         # Signup endpoint
│   │   └── orders/
│   │       ├── route.ts         # GET list, POST create
│   │       └── [id]/            # GET one, PATCH status + delivery link
│   │           └── upload/      # POST multipart file upload
│   ├── layout.tsx             # Root layout (fonts, theme, providers)
│   ├── page.tsx               # Landing page
│   └── globals.css            # Monochrome design tokens + utilities
├── components/
│   ├── providers/             # ThemeProvider, SessionProvider
│   ├── site/                  # Navbar, Hero, Footer, DashboardShell, OrdersTable, DeliveredFiles, AdminOrdersClient, OrderDetailDrawer, BriefingForm, etc.
│   └── ui/                    # shadcn/ui primitives
├── lib/
│   ├── auth/                  # NextAuth config + server helpers + password utils
│   ├── brand.ts               # Brand constants, pricing packages, FAQ items
│   ├── db.ts                  # Prisma client singleton
│   ├── orders.ts              # Order number generator + brief objective/style constants
│   └── utils.ts               # cn() helper
├── types/
│   └── domain.ts              # Shared TS types + ORDER_STATUS_META + ORDER_STATUS_FLOW
└── middleware.ts              # Route protection (auth + role-based)
```

### Database schema (Prisma)

- **User** — id, name, email, password (bcrypt), role (CLIENT/ADMIN), brandName, timestamps.
- **Order** — id, orderNumber (RZK-YYYY-####), clientId, brandName, industry, briefDetails (JSON), status (6-stage enum), deadline, deliveryFileUrl, deliveryFileName, timestamps.
- **OrderStatusUpdate** — audit trail: orderId, fromStatus, toStatus, changedById, note, createdAt.
- **Package** — pricing tiers (DB-backed, ready for future self-serve checkout).

### Status pipeline (forward-only)

```
PENDING  →  IDEATION  →  AI_GENERATION  →  EDITING  →  READY_FOR_REVIEW  →  DELIVERED
```

The API rejects backward transitions. `DELIVERED` requires an attached delivery file.

---

## 🎨 Design System

- **Palette**: pure luminance — `oklch(0.055 0 0)` background, `oklch(0.97 0 0)` text, primary = pure white on dark. Zero hue, zero saturation.
- **Typography**: Space Grotesk (display) · Inter (body) · Instrument Serif italic (accents) · Geist Mono (labels).
- **Backdrops**: radial white vignette + 35%-opacity film grain + faint 80px architectural grid (radial-masked).
- **Glassmorphism**: `.glass`, `.glass-strong`, `.glass-card` — `backdrop-blur(20-28px)` over `bg-white/[0.02-0.05]` with `border-white/[0.06-0.12]`.
- **Motion**: cubic-bezier(0.22, 1, 0.36, 1) easing throughout. fade-up / scale-in / blur-in / float keyframes.
- **Micro-interactions**: glow-white-soft on primary CTAs only, hairline dividers, custom monochrome scrollbar.

---

## 📜 Available Scripts

| Script                | Description                                            |
|-----------------------|--------------------------------------------------------|
| `bun run dev`         | Start the dev server (port 3000)                       |
| `bun run build`       | Production build (standalone output)                   |
| `bun run start`       | Run the production build                               |
| `bun run lint`        | ESLint                                                 |
| `bun run db:push`     | Push the Prisma schema to the database                 |
| `bun run db:generate` | Regenerate the Prisma client                           |
| `bun run db:seed`     | Seed admin + demo client + sample orders               |
| `bun run db:reset`    | Drop & recreate the database (destructive)             |

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (12 rounds).
- NextAuth JWT sessions — secret required (`NEXTAUTH_SECRET`).
- Middleware protects `/dashboard` (any auth) and `/admin` (ADMIN role only).
- API routes re-check auth + role server-side — middleware is not the only gate.
- Forward-only status transitions enforced in the PATCH handler.
- File upload validates type + size server-side.
- `.env*` is gitignored — never commit secrets.

For production, consider adding: rate-limiting on auth endpoints, CSRF protection, audit logging for admin actions, and replacing the demo seed credentials immediately after deploy.

---

## 📄 License

Proprietary — © CGLAB Studio.
