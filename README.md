# TaskFlow AI Automation Suite

Smart automation platform combining task management, webhook-based automation, AI decision-making, and real-world integrations (Slack, Google Sheets, Email). A focused mix of Zapier + Notion + Make.

## Features

- **AI rule builder** — describe an automation in plain English; an LLM (Groq) converts it to a structured, validated rule.
- **AI task suggestions** — suggests next tasks based on your current board.
- **AI log summarization** — turns raw activity logs into a short insight.
- **Webhook automation** — each rule gets a unique inbound webhook URL; conditions are evaluated and actions run automatically.
- **Real integrations** — Slack incoming webhooks, Google Sheets (append rows), Email (Nodemailer/SMTP).
- **Auth** — JWT-based register/login with bcrypt-hashed passwords.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| AI | Groq (OpenAI-compatible API, free tier) |
| CI/CD | GitLab CI + GitLab Pages |

## Architecture

```
[React SPA / GitLa Pages]  --HTTPS-->  [Express API / Render|Fly]
                                           |
   +-------+--------+---------+-----------+-------------+
   |       |        |         |           |             |
  Auth   Tasks    Rules    Webhooks    AI (Groq)     Logs
 (JWT)   CRUD    engine    pipeline   3 features   activity
   |       |        |         |           |             |
   +---------------- MongoDB Atlas --------------------+
                                           |
              Integrations: Slack / Google Sheets / Email
```

### Webhook processing pipeline

```
POST /api/hooks/:token
  -> find rule by token
  -> rule enabled?  (no -> log + 202 ignored)
  -> conditions match payload?  (no -> log + no_match)
  -> run each action (create_task | slack | sheets | email)
  -> write a log entry per step
  -> respond with per-action results
```

### AI processing pipeline

```
user text -> prompt with strict JSON schema hint -> Groq (json mode)
          -> parse + validate against allowed enums -> draft rule
          -> user reviews -> save to /api/rules
```

## Monorepo layout

```
.
├── backend/            # Express API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/         # User, Task, Rule, Log
│   │   ├── middleware/     # auth (JWT), error handling
│   │   ├── controllers/    # auth, task, rule, webhook, log, ai
│   │   ├── routes/
│   │   ├── services/       # ruleEvaluator, actionRunner, slack, sheets, email, groq, ai, log, interpolate
│   │   ├── utils/
│   │   ├── app.js          # Express app factory
│   │   └── server.js       # boot: connect DB then listen
│   └── test/               # node:test unit tests
└── frontend/           # React + Vite SPA
    └── src/
        ├── pages/          # Auth, Dashboard, RuleBuilder, Logs
        ├── components/     # Layout, ProtectedRoute, ui primitives
        ├── context/        # AuthContext
        └── lib/api.js      # fetch client with JWT
```

## Local development

```bash
# backend
cd backend && npm install && cp .env.example .env   # edit .env
npm run dev      # http://localhost:5000
npm test         # run unit tests

# frontend (new terminal)
cd frontend && npm install
npm run dev      # http://localhost:5173 (proxies /api to :5000)
```

You need a free MongoDB Atlas URI and a JWT secret to start the backend. AI and
integration features activate once their keys are set (see `backend/.env.example`).

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). Backend on Render/Fly, frontend on GitLab Pages, DB on Atlas.

## API reference

See [backend/README.md](backend/README.md) for the full endpoint list.

## Security

- Passwords are bcrypt-hashed; the hash is excluded from queries by default.
- All task/rule/log queries are scoped to the authenticated user (no cross-user access).
- Webhooks are authenticated by an unguessable 128-bit token in the URL.
- `helmet` sets security headers; `express-rate-limit` guards auth, API, and webhook endpoints; JSON bodies are capped at 100kb.
- Secrets (JWT, Groq, SMTP, Google) are environment-only and gitignored.
- Known limitation: JWT logout is client-side only (no server-side blocklist); tokens remain valid until expiry. Acceptable for a demo; a production system would add token revocation.

## Resume bullets

- Built a full-stack SaaS automation platform (React/Vite, Node/Express, MongoDB) with JWT auth, a condition-based rule engine, and a token-secured webhook ingestion pipeline.
- Integrated an LLM (Groq) to convert natural-language descriptions into validated automation rules, generate task suggestions, and summarize activity logs, with schema validation and graceful handling of rate limits and malformed model output.
- Implemented real third-party integrations (Slack webhooks, Google Sheets API via service-account auth, SMTP email) behind a pluggable action-runner abstraction with per-action error isolation and structured logging.
- Set up GitLab CI to run unit tests and deploy the SPA to GitLab Pages; documented a zero-cost deployment path (Atlas + Render/Fly + Pages).
