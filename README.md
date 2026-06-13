<div align="center">

# ⚡ TaskFlow AI Automation Suite

**A Smart, Self-Hosted Automation Platform**

<!-- Repository Health & Status Badges -->
[![Build Status](https://img.shields.io/github/actions/workflow/status/SunbalAzizLCWU/taskflow-automation-suite/deploy.yml?style=for-the-badge&color=50C878&labelColor=121212)](https://github.com/SunbalAzizLCWU/taskflow-automation-suite/actions)
[![Version](https://img.shields.io/badge/Version-v0.1.0_Beta-50C878?style=for-the-badge&labelColor=121212)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-50C878?style=for-the-badge&labelColor=121212)](https://opensource.org/licenses/MIT)
[![Code Style: Prettier](https://img.shields.io/badge/Code_Style-Prettier-50C878?style=for-the-badge&labelColor=121212)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-50C878?style=for-the-badge&labelColor=121212)](#)

<!-- Tech Stack Badges -->
[![React](https://img.shields.io/badge/React-18-50C878?style=for-the-badge&labelColor=121212&logo=react&logoColor=50C878)](#)
[![Node.js](https://img.shields.io/badge/Node.js-20+-50C878?style=for-the-badge&labelColor=121212&logo=node.js&logoColor=50C878)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-50C878?style=for-the-badge&labelColor=121212&logo=mongodb&logoColor=50C878)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-50C878?style=for-the-badge&labelColor=121212&logo=tailwind-css&logoColor=50C878)](#)
[![AI Powered](https://img.shields.io/badge/AI_Engine-Groq_Llama_3-50C878?style=for-the-badge&labelColor=121212)](#)

*A focused, enterprise-grade blend of Zapier, Notion, and Make—combining task management, webhook-driven automation, real-world integrations, and intelligent AI decision-making.*

</div>

---

## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Monorepo Layout](#-monorepo-layout)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Security](#-security)

---

## ✨ Features

- **AI rule builder** — describe an automation in plain English; an LLM (Groq) converts it to a structured, validated rule.
- **AI task suggestions** — suggests next tasks based on your current board.
- **AI log summarization** — turns raw activity logs into a short insight.
- **Webhook automation** — each rule gets a unique inbound webhook URL; conditions are evaluated and actions run automatically.
- **Real integrations** — Slack incoming webhooks, Google Sheets (append rows), Email (Nodemailer/SMTP).
- **Auth** — JWT-based register/login with bcrypt-hashed passwords.

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express, Mongoose |
| **Database** | MongoDB Atlas |
| **AI** | Groq (OpenAI-compatible API, free tier) |
| **CI/CD** | GitHub Actions + GitHub Pages |

---

## 🏗 Architecture

```text
[React SPA / GitHub Pages]  --HTTPS-->  [Express API / Render|Fly]
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

### Webhook Processing Pipeline

```text
POST /api/hooks/:token
  -> find rule by token
  -> rule enabled?  (no -> log + 202 ignored)
  -> conditions match payload?  (no -> log + no_match)
  -> run each action (create_task | slack | sheets | email)
  -> write a log entry per step
  -> respond with per-action results

```

### AI Processing Pipeline

```text
user text -> prompt with strict JSON schema hint -> Groq (json mode)
          -> parse + validate against allowed enums -> draft rule
          -> user reviews -> save to /api/rules

```

---

## 📁 Monorepo Layout

```text
.
├── backend/            # Express API
│   ├── src/
│   │   ├── config/     # db.js
│   │   ├── models/     # User, Task, Rule, Log
│   │   ├── middleware/ # auth (JWT), error handling
│   │   ├── controllers/# auth, task, rule, webhook, log, ai
│   │   ├── routes/
│   │   ├── services/   # ruleEvaluator, actionRunner, slack, sheets, email, groq, ai, log, interpolate
│   │   ├── utils/
│   │   ├── app.js      # Express app factory
│   │   └── server.js   # boot: connect DB then listen
│   └── test/           # node:test unit tests
└── frontend/           # React + Vite SPA
    └── src/
        ├── pages/      # Auth, Dashboard, RuleBuilder, Logs
        ├── components/ # Layout, ProtectedRoute, ui primitives
        ├── context/    # AuthContext
        └── lib/api.js  # fetch client with JWT

```

---

## 💻 Local Development

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

---

## 🌍 Deployment

See [Readme.md](https://github.com/SunbalAzizLCWU/taskflow-automation-suite/blob/2ddffea50a09e6d03867fe77d0544f2ddd942b93/README.md). Backend on Render/Fly, frontend on GitHub Pages, DB on Atlas.

---

## 📖 API Reference

See [backend/README.md](https://github.com/SunbalAzizLCWU/taskflow-automation-suite/blob/2ddffea50a09e6d03867fe77d0544f2ddd942b93/backend/README.md) for the full endpoint list.

---

## 🛡 Security

* Passwords are bcrypt-hashed; the hash is excluded from queries by default.
* All task/rule/log queries are scoped to the authenticated user (no cross-user access).
* Webhooks are authenticated by an unguessable 128-bit token in the URL.
* `helmet` sets security headers; `express-rate-limit` guards auth, API, and webhook endpoints; JSON bodies are capped at 100kb.
* Secrets (JWT, Groq, SMTP, Google) are environment-only and gitignored.
* Known limitation: JWT logout is client-side only (no server-side blocklist); tokens remain valid until expiry. Acceptable for a demo; a production system would add token revocation.

---
