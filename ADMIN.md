## Admin Guide

This guide explains how to access the Admin Panel and manage quizzes and users.

### 1) Admin Access
- Go to the site and log in as an admin user.
- If you do not have an admin user yet, create one on the backend (example script):
```bash
cd "AR-project-backend"
node scripts/create-admin.js
```
- The Admin Panel requires a valid JWT with role `admin`.

### 2) Tokens and Sessions
- Login/register returns a 7‑day access token (JWT) and sets a `refresh_token` HttpOnly cookie.
- When the access token expires, the frontend can call `POST /api/auth/refresh` to obtain a new access token.
- Logout by calling `POST /api/auth/logout` (revokes the refresh token and clears the cookie).

### 3) Admin Panel Features
Path: `src/pages/AdminPanel.jsx`

- User Management
  - View all users and basic details.
  - Requires an admin JWT in local storage.

- Quiz Management
  - Create/Update Categories
    - Choose a preset (e.g., General, Phishing, Fake Login, Password Security, USB Security, Safe Browsing).
    - Edit title/description.
    - Click "Save Category" to upsert.
  - Create Questions
    - Enter question text and up to four options.
    - Select the correct option.
    - Optionally add an explanation.
    - Click "Create Question".
  - Note: The frontend shows an empty state if a category has zero questions.

- Game Content Management
  - Create phishing email entries used by the "Phishing Email Detective" game.
  - Fields: Sender, Subject, Content, Indicators (comma separated), Is Phishing.
  - Click "Create Phishing Email" to add.
  - The game fetches active entries from `/api/game/phishing-emails`. If there are none, the game shows an empty state instead of fallback content.

### 4) Quiz API (for Admin)
Base path: `/api/quiz`

- Upsert Category
```
POST /api/quiz/admin/category
Authorization: Bearer <admin-access-token>
{
  "key": "phishing",
  "title": "Phishing Detection Quiz",
  "description": "Identify phishing attempts"
}
```

- Create Question
```
POST /api/quiz/admin/question
Authorization: Bearer <admin-access-token>
{
  "categoryKey": "phishing",
  "question": "Which trait suggests phishing?",
  "explanation": "Urgency is a red flag.",
  "options": ["Formal greeting", "Urgent action required", "Correct domain", "No links"],
  "correctIndex": 1
}
```

- Verify Category Questions (Public)
```
GET /api/quiz/category/phishing
```

### 5) Game API (for Admin)
Base path: `/api/game`

- Create Phishing Email
```
POST /api/game/admin/phishing-email
Authorization: Bearer <admin-access-token>
{
  "sender": "security@paypaI.com",
  "subject": "URGENT: Verify Now!",
  "content": "...",
  "isPhishing": true,
  "indicators": ["Misspelled domain", "Urgent language"]
}
```

- Update/Toggle Phishing Email
```
PATCH /api/game/admin/phishing-email/:id
Authorization: Bearer <admin-access-token>
{
  "active": false
}
```

- List Active Emails (Public)
```
GET /api/game/phishing-emails
```

### 6) Environment and CORS
- Backend `.env` must be set (see `IMPLEMENTATION_GUIDE.md`).
- For cookies (refresh token) to work across domains, the frontend must send `credentials: 'include'` and the backend CORS `origin` must be set to the frontend URL.

### 7) Troubleshooting
- 404 on `/api/quiz/admin/...`: backend isn’t deployed with the new routes or route not mounted. Ensure `server.js` has `app.use("/api/quiz", quizRoutes);`.
- `P1012 DATABASE_URL not found`: set `DATABASE_URL` in backend `.env` and run migrations.
- 401/403 on admin actions: ensure you’re logged in as an admin and the Authorization header is present.
- `background.js: Attempting to use a disconnected port object`: browser extension error; test in Incognito/disable extensions.


