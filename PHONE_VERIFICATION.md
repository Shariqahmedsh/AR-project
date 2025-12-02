## Phone Verification Flow (Frontend + Backend)

### Overview
- Signup is a staged flow: Phone → Code → Password.
- Backend sends a 6‑digit verification code via SMS (MessageCentral API).
- Redis is used for caching and cooldowns (optional but recommended).

### Environment Setup
Backend `.env` keys (examples):
- `MESSAGECENTRAL_AUTH_TOKEN=your-auth-token`
- `MESSAGECENTRAL_CUSTOMER_ID=your-customer-id`
- `MESSAGECENTRAL_SENDER_ID=your-sender-id`
- `MESSAGECENTRAL_COUNTRY_CODE=91`

Optional:
- `REDIS_URL=redis://localhost:6379`

Frontend `.env` (Vite):
- `VITE_API_URL=https://your-backend-host`

### Backend Endpoints
- `POST /api/auth/register` → creates unverified user, sends SMS code, returns token
- `POST /api/auth/verify-phone` → body: `{ phoneNumber, code }` → sets `isPhoneVerified=true`
- `POST /api/auth/resend-phone-code` → body: `{ phoneNumber }` → rate-limited via Redis
- `POST /api/auth/change-password` → sets real password after verification (Bearer token required)

### Frontend Flow
1) Phone step: Submit `username` + `email` + `phoneNumber` → call register → show Code step
2) Code step: Enter 6‑digit code → verify → show Password step
   - Include a Resend button with visible cooldown timer (e.g., 60s)
3) Password step: Set strong password → call change‑password with token

### Resend Cooldown (Recommended)
- Backend: store `resend:PHONE` in Redis with TTL (e.g., 60s). If key exists, reject.
- Frontend: show countdown on Resend button; disable until 0.

### Production Notes
- Use MessageCentral API for reliable SMS delivery.
- Configure proper sender ID for better deliverability.
- Do not commit SMS credentials; use environment variables.
- Test with different phone number formats and carriers.

### MessageCentral API Setup
1. Sign up for MessageCentral API access
2. Get your Auth Token, Customer ID, and Sender ID
3. Configure environment variables with your credentials
4. Test SMS delivery with your phone number

### Database Schema
```sql
model User {
  id              Int      @id @default(autoincrement())
  username        String   @unique
  email           String   @unique
  password        String
  phoneNumber     String?  @unique
  isPhoneVerified Boolean  @default(false)
  role            String   @default("user")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  smsVerifications SmsVerification[]
}

model SmsVerification {
  id        Int      @id @default(autoincrement())
  userId    Int
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Troubleshooting
- **SMS not received**: Check MessageCentral credentials and phone number format
- **Code expired**: Codes expire in 15 minutes, request a new one
- **Rate limiting**: Respect cooldown periods between SMS requests
- **Invalid phone**: Ensure phone number includes country code
