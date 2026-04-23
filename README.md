# CineOS — Production Engine

> Stop guessing. Start shooting.

CineOS is a logistics and automation platform built for Indian ad production. It turns a messy script into a GST-ready bid in seconds — giving producers, line producers, and production houses a single source of truth across the entire production workflow.

Live at [cineos-v2.vercel.app](https://cineos-v2.vercel.app)

---

## What It Does

- **Instant Bidding** — Upload a script or brief and generate a structured, GST-compliant budget estimate
- **Production Logistics** — Manage crew, equipment, locations, and schedules in one place
- **Document Automation** — Auto-generate call sheets, purchase orders, and cost reports
- **AI-Assisted Planning** — Powered by Google Gemini to surface estimates, flag conflicts, and suggest resources
- **PDF Ingestion** — Parse and extract data from existing briefs and scripts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 + Framer Motion |
| Backend / Auth | Supabase |
| State Management | Zustand |
| AI | Google Gemini (`@google/genai`) |
| PDF Processing | pdf2json, pdfjs-dist |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))
- A Google Gemini API key ([ai.google.dev](https://ai.google.dev))

### Installation

```bash
git clone https://github.com/aludde/cineos-engine.git
cd cineos-engine
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

cineos-engine/
├── public/               # Static assets
├── src/
│   └── app/              # Next.js App Router pages and API routes
├── next.config.ts        # Next.js configuration
├── tailwind.config.*     # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Deployment

The app is deployed on [Vercel](https://vercel.com). To deploy your own instance:

1. Push the repo to GitHub
2. Import it in the Vercel dashboard
3. Add the environment variables above under **Project Settings → Environment Variables**
4. Deploy

---

## Important Note for Contributors

This project uses **Next.js 16**, which contains breaking changes from earlier versions. APIs, conventions, and file structure may differ from what you're used to. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`.

---

## Roadmap

- [ ] Onboarding flow with sample project
- [ ] Mobile-optimised views
- [ ] Crew rate card database (India-specific)
- [ ] Multi-user / team access with roles
- [ ] Export to PDF / Excel
- [ ] WhatsApp notifications for call sheets

---

## License

Private — All rights reserved.
