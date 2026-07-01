# DevPortfolio CMS

CMS per developer portfolio con dashboard admin, analytics e integrazione GitHub.

## Requisiti

- Node.js 20+
- PostgreSQL 16+
- Docker (opzionale, per sviluppo)

## Variabili d'ambiente

Crea un file `.env` nella root del progetto con le seguenti variabili:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/portfolio"

# URL applicazione (senza slash finale)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Autenticazione — genera con: openssl rand -base64 32
NEXTAUTH_SECRET="i6T+ddh4jrvR7CGpPfa67e3jAfPaUiWzuC+Mcu4mOC0="
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_ID=""
GITHUB_SECRET=""

# Resend (per email reset password e notifiche contatti)
RESEND_API_KEY=""

# Cloudinary (per upload immagini)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Uploadthing (in alternativa a Cloudinary)
UPLOADTHING_TOKEN=""

# Cloudflare Turnstile (per form contatti)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
```

### ⚠️  Resend — limitazione importante

Con l'API key gratuita di Resend e il mittente `onboarding@resend.dev`, **le email vengono recapitate solo all'indirizzo con cui ti sei registrato su Resend**.

Questo significa che:
- L'**email che usi per creare l'account admin** sulla dashboard deve essere la **stessa con cui ti sei iscritto a Resend**.
- Le email di reset password arrivano solo a quell'indirizzo.
- Le notifiche dei messaggi del form contatti arrivano solo a quell'indirizzo.

Per inviare email a qualsiasi destinatario, verifica un dominio su [Resend Domains](https://resend.com/domains) e cambia il `from` nel codice da `onboarding@resend.dev` a `noreply@tuodominio.com`.

## Setup

### Locale

```bash
# 1. Crea il database PostgreSQL
createdb portfolio

# 2. Installa dipendenze
npm install

# 3. Esegui le migrazioni
npx prisma migrate dev

# 4. Avvia in sviluppo
npm run dev
```

### Con Docker

```bash
# Avvia i container in background
npm run docker:dev

# Oppure con rebuild dell'immagine
npm run docker:up

# Reset completo (cancella volumi + riapplica migrazioni)
npm run docker:reset

# Log in tempo reale
npm run docker:logs

# Log solo dell'app
npm run docker:logs:app

# Log solo del database
npm run docker:logs:db

# Ferma i container
npm run docker:down
```

> `docker:reset` esegue: down con rimozione volumi → up → attesa 5s → `prisma migrate deploy`. Utile per ripartire da zero con lo schema applicato ma database vuoto.

## GitHub OAuth

1. Vai su https://github.com/settings/developers → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copia Client ID e Client Secret nelle variabili `GITHUB_ID` e `GITHUB_SECRET`

## Comandi disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia Next.js in sviluppo |
| `npm run build` | Build di produzione |
| `npm run start` | Avvia la build di produzione |
| `npm run lint` | Esegui ESLint |
| `npm run docker:dev` | `docker compose up -d` |
| `npm run docker:up` | `docker compose up --build` |
| `npm run docker:down` | `docker compose down` |
| `npm run docker:reset` | Down con -v, up, migrazioni |
| `npm run docker:logs` | Log di tutti i servizi |

## Struttura progetto

```
src/
├── app/
│   ├── (auth)/           # Login, registrazione, reset password
│   ├── (public)/         # Sito pubblico (homepage, progetti, contatti)
│   └── dashboard/        # Admin dashboard
├── components/           # Componenti riutilizzabili
├── lib/
│   ├── actions/          # Server actions (auth, contact, projects, etc.)
│   ├── email/            # Template e funzioni email
│   └── prisma.ts         # Client Prisma
└── auth.ts               # Configurazione NextAuth
```

## Funzionalità

### Dashboard admin
- Panoramica con statistiche visite e ultimi messaggi
- Gestione progetti (CRUD, import da GitHub, feature/publish)
- Gestione esperienze e skills
- Form contatti con messaggi in entrata
- Analytics (page view, project view, click tracking)
- Impostazioni aspetto (tema, colore accent, sezioni homepage)
- Notifiche interne (nuovo messaggio, sync GitHub)
- Integrazione GitHub (import repo, sync stelle/topics)

### Sito pubblico
- Homepage con sezioni configurabili (hero, progetti, esperienze, skills)
- Pagina About con timeline esperienze e skills
- Pagina Progetti con filtro per categoria
- Pagina Contatti con form
- Tema chiaro/scuro configurabile dalla dashboard

### Autenticazione
- Login con email/password
- Login con GitHub OAuth
- Registrazione nuovo account
- Recupero password via email (tramite Resend)

## TODO rimanenti

- [ ] Verificare un dominio su Resend per abilitare l'invio a email arbitrari
- [ ] Configurare Cloudflare Turnstile con chiavi reali (attualmente il form contatti funziona senza)
- [ ] Aggiungere cron job per pubblicazione programmata progetti
- [ ] Aggiungere cache Redis per analytics
- [ ] Test E2E con Playwright
