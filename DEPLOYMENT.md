# Deployment

Three pieces: database (MongoDB Atlas), backend API (Render or Fly.io), frontend (GitLab Pages).

## 1. Database — MongoDB Atlas (free M0)

1. Create a free cluster at https://www.mongodb.com/atlas .
2. Create a database user and allow network access (0.0.0.0/0 for a demo).
3. Copy the connection string into the backend's `MONGODB_URI`.

## 2. Backend — Render (free) or Fly.io (free)

### Render
- New > Web Service > connect this repo, root directory `backend`.
- Build command: `npm install`  Start command: `npm start`.
- Add env vars from `backend/.env.example` (at minimum `MONGODB_URI`, `JWT_SECRET`,
  `CLIENT_ORIGIN`, and any integration/AI keys you use).
  - Note: the free tier sleeps after ~15 min idle; first request wakes it (~30s).

  ### Fly.io (alternative, no sleep on free allowance)
  - `fly launch` in `backend/`, set secrets with `fly secrets set KEY=value`.

  Set `CLIENT_ORIGIN` to your Pages URL so CORS allows the frontend.

  ## 3. Frontend — GitLab Pages (free, no cold start)

  The `.gitlab-ci.yml` `pages` job builds `frontend/` and publishes it.

  1. In **Settings > CI/CD > Variables**, add `BACKEND_URL` = your deployed backend
     origin (e.g. `https://taskflow-api.onrender.com`). This is injected as
        `VITE_API_URL` at build time.
        2. Push to the default branch; the `pages` job deploys automatically.
        3. Find the URL under **Deploy > Pages**.

        ## Order of operations

        Atlas first → deploy backend (needs Atlas URI) → set `BACKEND_URL` → deploy Pages
        → set backend `CLIENT_ORIGIN` to the Pages URL.
        