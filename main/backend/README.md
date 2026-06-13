# TaskFlow Backend

Node.js + Express + MongoDB (Mongoose) API.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env with real values
npm run dev            # starts on PORT (default 5000) with file watching
```

## Environment

See `.env.example`. You need at minimum `MONGODB_URI` and `JWT_SECRET` to run.

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Current endpoints

| Method | Path                 | Auth | Description              |
|--------|----------------------|------|--------------------------|
| GET    | /api/health          | no   | Liveness check           |
| POST   | /api/auth/register   | no   | Register, returns token  |
| POST   | /api/auth/login      | no   | Login, returns token     |
| GET    | /api/auth/me         | yes  | Current user             |
| GET    | /api/tasks           | yes  | List own tasks           |
| POST   | /api/tasks           | yes  | Create task              |
| GET    | /api/tasks/:id       | yes  | Get one task             |
| PATCH  | /api/tasks/:id       | yes  | Update task              |
| DELETE | /api/tasks/:id       | yes  | Delete task              |

| GET    | /api/logs            | yes  | List own activity logs   |
| POST   | /api/ai/rule         | yes  | NL description -> rule   |
| GET    | /api/ai/suggest-tasks| yes  | AI task suggestions      |
| POST   | /api/ai/summarize-logs| yes | AI log summary           |
| POST   | /api/hooks/:token    | no   | Inbound webhook trigger  |

Authenticated requests need header: `Authorization: Bearer <token>`.

## Integration actions

Rule actions support `slack`, `sheets`, and `email` in addition to `create_task`.
Action `params` strings may use `{{path}}` placeholders that pull from the webhook
payload (e.g. `{{title}}`, `{{priority}}`).

- **slack** — `params: { text, webhookUrl? }`. Posts to an incoming webhook.
  Create one at https://api.slack.com/messaging/webhooks. Falls back to
  `SLACK_WEBHOOK_URL` if `webhookUrl` is omitted.
- **sheets** — `params: { columns: ["{{title}}", "{{priority}}"], spreadsheetId?, range? }`.
  Appends a row using a Google service account (free).
- **email** — `params: { to, subject, text }`. Sends via SMTP (Nodemailer).

### Google Sheets setup (free)

1. Create a Google Cloud project and enable the **Google Sheets API**.
2. Create a **service account** and download its JSON key.
3. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` to the key's `client_email` and
   `GOOGLE_PRIVATE_KEY` to its `private_key` (keep the `\n` escapes).
4. Open your target spreadsheet and **share it with the service account email**
   as an Editor. Put its id in `GOOGLE_SHEET_ID`.

### Slack setup (free)

1. Create a Slack app, enable **Incoming Webhooks**, add one to a channel.
2. Copy the webhook URL into `SLACK_WEBHOOK_URL` (or per-rule `params.webhookUrl`).

### Email setup (free)

Use a Gmail **App Password** (with 2FA enabled) or https://ethereal.email for
throwaway test inboxes. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
`MAIL_FROM`.

## How JWT auth works here

1. On register/login the server verifies credentials and signs a token containing
   the user id (`{ sub: userId }`) using `JWT_SECRET`.
2. The client stores the token and sends it as `Authorization: Bearer <token>`.
3. The `protect` middleware verifies the signature, loads the user, and attaches
   it to `req.user`. No server-side session storage is needed.
