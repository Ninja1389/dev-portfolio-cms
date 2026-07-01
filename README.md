# DevPortfolio CMS

> A developer portfolio CMS with an admin dashboard, analytics, GitHub integration, and a fully
> customizable public-facing site. Self-hosted, no external dependencies.

## Overview

DevPortfolio CMS is a self-hosted content management system for developer portfolios. It provides
a complete admin dashboard to manage projects, experiences, skills, and site appearance, while
exposing a public-facing portfolio site with analytics tracking.

Built with Next.js 16 App Router, Prisma 7, PostgreSQL, and NextAuth.js v5. Supports both
email/password and GitHub OAuth authentication. The public site is configurable in real time
from the dashboard — theme, accent color, hero section, section order, and more.

## Features

- **Admin Dashboard** — Overview with visit statistics and recent messages. Manage projects
  (CRUD, import from GitHub, feature/publish), experiences, skills, and contact messages.
- **Analytics** — Portfolio visits, project views, click tracking, and traffic source analysis
  with interactive Recharts bar charts.
- **GitHub Integration** — Import repositories as portfolio projects, sync stars and topics,
  connect via OAuth with a single click. Dedicated integration page with repository listing.
- **Public Portfolio Site** — Fully customizable homepage with configurable sections (hero,
  projects, experiences, skills). About page with experience timeline, Projects page with
  category filtering, Contact form.
- **Appearance Customization** — Real-time theme switching (light/dark), accent color,
  brand name, hero headline, and section visibility — all configurable from the dashboard
  without redeploying.
- **Authentication** — Email/password registration with bcrypt hashing, NextAuth.js v5 JWT
  sessions via httpOnly cookies, GitHub OAuth. Password reset flow via email (Resend).
  JWT automatically invalidated if the user is deleted from the database.
- **Contact Form** — Turnstile-protected contact form with messages saved to the database,
  internal notifications, and optional email notification via Resend.
- **Notifications** — In-app notification system for new messages, GitHub sync status,
  and system events.
- **Drag-and-Drop Ordering** — Reorder projects, experiences, and skills using `@dnd-kit`.
- **SEO** — Auto-generated `sitemap.xml` and `robots.txt` via Next.js built-in support.
- **Dockerized** — Development `docker-compose.yml` with PostgreSQL 16 and hot-reload
  via volume mounts. Single-command setup with `npm run docker:reset`.

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Language       | TypeScript 5                            |
| Runtime        | Node.js 20+                             |
| Framework      | Next.js 16 (App Router)                 |
| ORM            | Prisma 7 + PostgreSQL 16                |
| Auth           | NextAuth.js v5 (credentials + GitHub)   |
| Email          | Resend                                  |
| Frontend       | React 19 + Tailwind CSS v4              |
| UI Components  | shadcn/ui + Radix UI primitives         |
| Forms          | react-hook-form + @hookform/resolvers   |
| Charts         | Recharts 3                              |
| Drag & Drop    | @dnd-kit                                |
| Upload         | Uploadthing / Cloudinary                |
| Icons          | lucide-react                            |
| Container      | Docker + Docker Compose                 |

## Prerequisites

- **Node.js** >= 20
- **PostgreSQL** >= 16 (or use the `docker-compose.yml` db service)
- **Docker** (optional, for containerized development)

## Getting Started

### Local

```bash
# 1. Clone the repository
git clone <repo-url>
cd dev-portfolio-cms

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your own values (see Configuration section)

# 4. Create the database and apply migrations
createdb portfolio
npx prisma migrate dev

# 5. Start the development server
npm run dev     # http://localhost:3000
```

### Docker

```bash
# Create .env file with required variables
cp .env.example .env

# Start with build
npm run docker:up

# Or start in background (no build output)
npm run docker:dev

# Full reset (wipes volumes + reapplies migrations)
npm run docker:reset

# View logs
npm run docker:logs    # all services
npm run docker:logs:app  # app only
npm run docker:logs:db   # database only

# Stop
npm run docker:down
```

> `docker:reset` runs: `docker compose down -v && docker compose up -d && sleep 5 && npx prisma migrate deploy`. Use this to start fresh with an empty database.

After starting, register a new account at `http://localhost:3000/dashboard`.

## Configuration

All environment variables go in `.env` at the project root. Docker Compose reads this file
automatically.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://postgres:postgres@localhost:5433/portfolio`) |
| `NEXTAUTH_SECRET` | Yes | NextAuth secret for JWT signing (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Application URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application URL (e.g. `http://localhost:3000`) |
| `GITHUB_ID` | No | GitHub OAuth Client ID |
| `GITHUB_SECRET` | No | GitHub OAuth Client Secret |
| `RESEND_API_KEY` | No | Resend API key for transactional emails (reset password, contact notifications) |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `UPLOADTHING_TOKEN` | No | Uploadthing token (alternative to Cloudinary) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile secret key |

### ⚠️ Resend Email Limitation

Resend's free tier with `onboarding@resend.dev` only delivers emails to the email address
you registered with on Resend. This means:

- The **email you use to register on the dashboard** must be the **same email you used
  to sign up for Resend**.
- Password reset emails are only delivered to that address.
- Contact form notifications are only delivered to that address.

To send emails to any recipient, verify a custom domain on [Resend Domains](https://resend.com/domains)
and update the `from` address in `src/lib/actions/auth.ts` and `src/lib/email/notify-contact.ts`.

## Usage

After starting, register an account at `http://localhost:3000/dashboard`.

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to `GITHUB_ID` and `GITHUB_SECRET` in `.env`
5. On the integration page, click **"Collega account GitHub"** to authorize

### Dashboard Sections

| Section | Path | Description |
| ------- | ---- | ----------- |
| Overview | `/dashboard` | Visit stats, recent messages, quick actions |
| Projects | `/dashboard/projects` | CRUD, import from GitHub, drag-to-reorder |
| Experiences | `/dashboard/experiences` | Add/edit work history with timeline ordering |
| Skills | `/dashboard/skills` | Manage skills with drag-to-reorder |
| Messages | `/dashboard/messages` | Inbox for contact form submissions |
| Analytics | `/dashboard/analytics` | Charts for visits, project views, click events, traffic sources |
| Integrations | `/dashboard/integrations/github` | GitHub repo import and sync |
| Settings | `/dashboard/settings` | Account info and appearance (theme, color, sections config) |

### Public Site Routes

| Path | Description |
| ---- | ----------- |
| `/` | Homepage with configurable sections (hero, projects, experiences, skills) |
| `/about` | About page with experience timeline and skills |
| `/projects` | All projects with category filtering |
| `/contact` | Contact form with Turnstile protection |

## Project Structure

```
dev-portfolio-cms/
├── prisma/
│   ├── schema.prisma          # Database models and relations (13 models)
│   └── migrations/            # Prisma migration history
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register, forgot/reset password pages
│   │   ├── (public)/          # Public portfolio site (homepage, about, projects, contact)
│   │   ├── api/               # Next.js API route handlers (auth, tracking, upload)
│   │   └── dashboard/         # Admin dashboard pages
│   │       ├── analytics/     # Visit charts and statistics
│   │       ├── experiences/   # Work experience management
│   │       ├── integrations/  # GitHub OAuth and repo import
│   │       ├── messages/      # Contact form inbox
│   │       ├── profile/       # User profile editing
│   │       ├── projects/      # Project CRUD and GitHub import
│   │       ├── settings/      # Account settings and appearance
│   │       └── skills/        # Skill management
│   ├── auth.ts                # NextAuth.js v5 configuration
│   ├── proxy.ts               # Edge middleware (optional)
│   ├── components/
│   │   ├── auth/              # Auth-related components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── theme/             # Theme provider and toggle
│   │   ├── tracking/          # Analytics tracking components
│   │   └── ui/                # shadcn/ui primitives
│   └── lib/
│       ├── actions/           # Server actions (auth, contact, projects, skills, etc.)
│       ├── analytics/         # Analytics query functions
│       ├── email/             # Email notification templates
│       ├── github/            # GitHub API client
│       ├── prisma.ts          # Prisma client singleton
│       └── ...                # Utility modules (slugify, uploadthing, etc.)
├── Dockerfile.dev             # Dockerfile for development (hot-reload)
├── docker-compose.yml         # PostgreSQL 16 + Next.js app
├── prisma.config.ts           # Prisma configuration file
└── package.json               # Scripts and dependencies
```

## Database Models

The Prisma schema defines 13 models:

- **User** — Core user profile with portfolio settings (theme, accent color, sections config, social links)
- **Account / Session / VerificationToken** — NextAuth.js required models for OAuth and session management
- **Project** — Portfolio projects with GitHub integration fields, featured/published status
- **Experience** — Work history entries with company, role, date range
- **Skill** — Skills with category, optional icon, order
- **ContactMessage** — Contact form submissions from the public site
- **ProjectView / PageView / ClickEvent** — Analytics tracking data
- **PasswordResetToken** — Single-use tokens for password reset flow
- **Notification** — In-app notifications (new messages, GitHub sync events)

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run docker:up` | Build and start all Docker Compose services |
| `npm run docker:dev` | Start services in detached mode |
| `npm run docker:down` | Stop and remove Docker Compose services |
| `npm run docker:reset` | Stop services, remove volumes (resets DB), restart, apply migrations |
| `npm run docker:logs` | Tail logs from all services |
| `npm run docker:logs:app` | Tail logs from the app service only |
| `npm run docker:logs:db` | Tail logs from the database service only |

## License

This project is licensed under the [Apache License 2.0](LICENSE).
