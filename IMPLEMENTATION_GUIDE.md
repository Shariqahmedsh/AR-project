## Implementation Guide

This document summarizes recent changes and how to run, test, and use them.

### API Base URL
- Default frontend `VITE_API_URL`: points to your deployed API or local dev.
- Example: `https://ar-project-5ojn.onrender.com` or `http://localhost:5001`.

---

## 1) AR Preview (model-viewer)
- The AR preview uses `<model-viewer>` with AR enabled and a transparent background.
- File: `src/pages/ARScenarios.jsx`
- Key props: `ar`, `ar-modes="webxr scene-viewer quick-look"`, `style={{ background: 'transparent' }}`.
- Shows device camera in AR mode if supported; otherwise displays a clear fallback.

---

## 2) Quizzes from Database

### Prisma Models
Defined in `AR-project-backend/prisma/schema.prisma`:
- `QuizCategory` (key, title, description)
- `QuizQuestion` (question, explanation, category)
- `QuizOption` (text, isCorrect, question)

### REST Endpoints
Mounted at `/api/quiz` in `AR-project-backend/server.js` via `routes/quizRoutes.js`.
- Public
  - `GET /api/quiz/categories` → list categories
  - `GET /api/quiz/category/:key` → questions/options for a category
- Admin (Bearer token with role "admin")
  - `POST /api/quiz/admin/category` → upsert category `{ key, title, description? }`
  - `POST /api/quiz/admin/question` → create question `{ categoryKey, question, explanation?, options: string[], correctIndex }`

### Frontend Integration
- `src/lib/api.js` extended with `endpoints.quiz` entries.
- `src/pages/Quiz.jsx` fetches backend quiz by category key. There is no built‑in fallback now. If no questions are present, the UI shows a clear empty state.
- `src/pages/AdminPanel.jsx` includes a simple "Quiz Management" section to upsert categories and create questions.

---

## 3) Game Content from Database

### Prisma Models
- `PhishingEmail` (sender, subject, content, isPhishing, indicators[], active)

### REST Endpoints
Mounted at `/api/game` in `AR-project-backend/server.js` via `routes/gameRoutes.js`.
- Public
  - `GET /api/game/phishing-emails` → list active emails
- Admin (Bearer token, role `admin`)
  - `POST /api/game/admin/phishing-email` → create phishing email entry
  - `PATCH /api/game/admin/phishing-email/:id` → update/toggle fields

### Frontend Integration
- `src/pages/Game.jsx` loads phishing emails from the API when the "Phishing Email Detective" game starts. There is no built‑in fallback now; an empty state is shown if none exist.
- Admin Panel hosts a simple creator UI for phishing emails (see section below).

---

## 4) Auth, JWTs, and Refresh Tokens

### Access Token (JWT)
- 7‑day expiry by default (`JWT_EXPIRES_IN=7d`).
- Created in `routes/authRoutes.js` (`createAccessToken`).

### Refresh Token (HttpOnly Cookie)
- Model: `RefreshToken` (Prisma) linked to `User`.
- On register/login/admin login, a `refresh_token` cookie is issued (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
- Endpoints:
  - `POST /api/auth/refresh` → returns `{ token }` using cookie.
  - `POST /api/auth/logout` → revokes current refresh token and clears cookie.

### Frontend Notes
- Continue sending access token via Authorization header.
- To auto‑refresh: on 401, call `/api/auth/refresh` with `credentials: 'include'`, update token, retry.

---

## 5) Request/Response Logging
- Lightweight logger added in `server.js` after `express.json()`.
- Logs incoming method/URL and outgoing status/duration.
- Redacts sensitive auth payloads/response previews.

---

## 6) Environment & Setup

### Backend `.env`
```
DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d
REFRESH_TTL_DAYS=30
PORT=5001
```

### Install, Generate, Migrate, Run
```bash
cd "AR-project-backend"
npm i
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend
```bash
cd ".."   # project root
npm i
npm run dev
```
Ensure `VITE_API_URL` points to your backend.

---

## 7) Quick Admin Flow (cURL)

Login (admin):
```bash
curl -s -X POST $API/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<ADMIN_PASSWORD>"}'
```

Upsert Category:
```bash
curl -s -X POST $API/api/quiz/admin/category \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"key":"phishing","title":"Phishing Detection Quiz","description":"Identify phishing attempts"}'
```

Create Question:
```bash
curl -s -X POST $API/api/quiz/admin/question \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"categoryKey":"phishing","question":"Which trait suggests phishing?","options":["Formal greeting","Urgent action required","Correct domain","No links"],"correctIndex":1}'
```

Fetch Questions:
```bash
curl -s $API/api/quiz/category/phishing | jq
```

---

## 8) Game Content (cURL)

Create a phishing email (admin):
```bash
curl -s -X POST $API/api/game/admin/phishing-email \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"sender":"security@paypaI.com","subject":"URGENT: Verify Now!","content":"...","isPhishing":true,"indicators":["Misspelled domain","Urgent language"]}'
```

List active emails (public):
```bash
curl -s $API/api/game/phishing-emails | jq
```

---

## 9) Common Issues
- 404 on `/api/quiz/...`: backend not redeployed with `quizRoutes` or route not mounted.
- `P1012 DATABASE_URL not found`: set `DATABASE_URL` in backend `.env` before migrations.
- `background.js: Attempting to use a disconnected port object`: browser extension error; test in Incognito.


