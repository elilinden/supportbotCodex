# Pro-Se Prime — NY Family Court OP Navigator

An information-only workspace that helps domestic violence survivors prepare for New York Family Court Orders of Protection filings. Not legal advice.

## What it does

- **Guided intake** — plain-language questions about relationship eligibility, incidents, safety, and proof
- **AI-powered coaching** — identifies missing details courts commonly ask about (dates, locations, injuries, threats, witnesses, weapons)
- **Evidence organization** — builds a checklist of texts, photos, reports, witness names, and logs
- **Court roadmap** — generates court-ready scripts, timelines, and personalized strategy tips

## Project structure

```
supportbotCodex/
├── web/          # Next.js 14 frontend (main app)
├── server/       # Express.js backend (customer support chat autopilot — separate feature)
└── extension/    # Chrome Extension (live chat widget automation — separate feature)
```

The **web** app is the primary application. The **server** and **extension** directories contain a separate customer support chat autopilot feature.

## Getting started

### Prerequisites

- Node.js 18+
- A Google Gemini API key

### Web app (main)

```bash
cd web
cp .env.local.example .env.local    # add your GEMINI_API_KEY
npm install
npm run dev                          # http://localhost:3000
```

### Server (customer support chat)

```bash
cd server
cp .env.example .env                 # add your GEMINI_API_KEY and optional SERVER_API_KEY
npm install
npm run dev                          # http://localhost:8787
```

### Chrome extension

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. Ensure the server is running at `localhost:8787`

## Environment variables

### Web (`web/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `SERVER_API_KEY` | No | API key for endpoint auth (if set, clients must send `x-api-key` header) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `http://localhost:3000,chrome-extension://`) |
| `PORT` | No | Server port (default: `8787`) |
| `MOCK_LLM` | No | Set to `true` for mock AI responses in testing |

## Scripts

### Web

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |

### Server

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start production server |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |

## Architecture

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Zustand (state)
- **AI**: Google Gemini API (flash model)
- **Validation**: Zod schemas for API request/response validation
- **Storage**: Browser localStorage with obfuscation layer
- **Testing**: Vitest (web), Jest (server)

## Safety and privacy

- All case data stays in your browser (localStorage)
- Data can be exported as JSON or wiped from Settings
- Safety detection interrupts the interview if danger patterns are detected
- Not a substitute for emergency services — call 911 if in immediate danger

## Legal disclaimer

This application is for informational purposes only. It is not legal advice and does not create an attorney-client relationship. Court procedures and eligibility vary by county and facts. Always confirm critical information with official court resources or a qualified attorney.
