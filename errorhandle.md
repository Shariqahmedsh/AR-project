## Error handling and user-facing messages

### Scope
This document lists error messages currently returned from the backend to the frontend and suggests user-friendly wording where helpful. It also notes the behavior of the global error handler.

### Global error handler
- Logs error details on the server and returns a JSON response.
- Default fallback: status 500 with `{"error":"Internal server error"}` if no explicit status/message was set.
- If a thrown error provides `err.status` and `err.message`, those are used.

### Authentication (`/api/auth/...`)
- 400: "Username, email, password, and phoneNumber are required"
- 400: "Username already exists"
- 400: "Email already in use"
- 400: "Phone number already in use"
- 500: "Failed to create user"
- 400: "Username and password are required"
- 401: "Invalid username or password"
- 403: "Phone verification required"
- 500: "Login failed"
- 400: "Username and password are required" (admin)
- 401: "Invalid admin credentials"
- 500: "Admin login failed"
- 401: "Access token required"
- 403: "Invalid or expired token"
- 404: "User not found"
- 500: "Failed to fetch profile"
- 400: "Current password and new password are required"
- 400: "New password must be at least 6 characters long"
- 401: "Current password is incorrect"
- 500: "Failed to change password"
- 401: "No token provided" (admin list)
- 403: "Admin access required"
- 500: "Failed to fetch users"
- 401: "No token provided" (admin delete)
- 401: "Invalid token"
- 404: "User not found"
- 400: "Cannot delete admin users"
- 400: "Admins cannot delete themselves"
- 500: "Cannot delete user due to foreign key constraints"
- 500: "Failed to delete user"
- 400: "phoneNumber, code and verificationId are required"
- 400: "phoneNumber is required"
- 200: "Phone already verified"
- 500: "Failed to resend code"
- 200: "If the phone number exists, a code has been sent"
- 500: "Unable to process request"
- 400: "Phone number, code and new password are required"
- 400: "New password must be at least 6 characters"
- 400: "Invalid or expired code" (or "Invalid code" / "Code expired")
- 500: "Unable to reset password"
- 401: "No refresh token"
- 401: "Invalid refresh token"
- 401: "User not found"
- 500: "Failed to refresh token"
- 200: "Logged out"
- 400: "Email is required" (manual-verify)
- 500: "Failed to verify user"
- 500: "Failed to create admin user"
- 400: "Username is required" (manual-verify-admin)
- 500: "Failed to make user admin"
- 401: "No token provided" (admin verify-user)
- 403: "Admin access required"
- 400: "Email is required"
- 404: "User not found"

### Users (`/api/users/...`)
- 500: "Failed to fetch users"
- 400: "Failed to create user"

### Quiz (`/api/quiz/...`)
- 500: "Failed to fetch categories"
- 404: "Category not found"
- 500: "Failed to fetch questions"
- 403: "Admin only"
- 400: "key and title are required"
- 500: "Failed to save category"
- 403: "Admin only"
- 400: "categoryKey, question and at least 2 options required"
- 400: "valid correctIndex required"
- 404: "Category not found"
- 500: "Failed to create question"
- 403: "Admin access required"
- 500: "Failed to fetch questions"
- 403: "Admin access required"
- 400: "Invalid question ID"
- 409: "Cannot delete question due to related records"
- 404: "Question not found"
- 500: "Failed to delete question"
- 403: "Admin only"
- 400: "Invalid question ID"
- 404: "Question not found"
- 500: "Failed to update question"

### Game (`/api/game/...`)
- 500: "Failed to fetch phishing emails"
- 403: "Admin only"
- 400: "sender, subject, content required"
- 500: "Failed to create phishing email"
- 403: "Admin only"
- 500: "Failed to update phishing email"
- 403: "Admin only"
- 404: "Not found"
- 500: "Failed to delete phishing email"

### Progress (`/api/progress/...`)
- 500: "Failed to fetch progress"
- 400: "Missing required fields"
- 500: "Failed to record quiz attempt"
- 400: "Missing scenario key"
- 500: "Failed to record scenario completion"
- 500: "Failed to fetch quiz attempts"
- 500: "Failed to fetch scenario completions"
- 403: "Admin access required"
- 500: "Failed to fetch progress data"

### Suggested user-friendly phrasing
- "Admin only" → "Only admins can perform this action."
- "Not found" → "Item not found."
- "Access token required" → "Please sign in to continue."
- "No token provided" / "Invalid token" → "Your session has expired. Please sign in again."
- "Invalid or expired code" → "The verification code is incorrect or has expired."
- "Cannot delete admin users" → "Admin accounts cannot be deleted."
- "Admins cannot delete themselves" → "You cannot delete your own admin account."
- Generic "Failed to ..." → "We couldn't complete that action right now. Please try again."

These suggestions keep messages simple and actionable for end users while avoiding technical jargon. The backend already redacts sensitive payloads and centrally logs full details for developers.


### Response schema conventions
- Error responses use a consistent shape:
  - `{ "error": string }` for a single message
  - `{ "error": string, "details": string | object }` when extra safe context helps the user
- Success responses avoid mixing error fields.

### HTTP status code guidelines
- 400 Bad Request: Missing/invalid input (e.g., required fields, validation failures)
- 401 Unauthorized: Not signed in or token missing/invalid/expired
- 403 Forbidden: Signed in but lacks permission (non-admin on admin route)
- 404 Not Found: Resource does not exist (user, category, question, item)
- 409 Conflict: Action can’t proceed due to related records or state conflict
- 422 Unprocessable Entity: Structured validation errors (optional alternative to 400)
- 500 Internal Server Error: Unexpected server error

### Validation errors (structured)
When there are multiple field issues, prefer returning a structured list the frontend can render inline:

```json
{
  "error": "Validation failed",
  "details": {
    "username": "Username is required",
    "password": "Password must be at least 6 characters"
  }
}
```

Backends may still return a single `{ "error": "..." }` for simple cases.

### Security and privacy
- Never echo secrets or credentials back to the client.
- Avoid leaking internal identifiers or stack traces in responses.
- Global logger redacts auth-sensitive request fields and trims large payloads before logging.

### Correlation ID (optional enhancement)
- Add a per-request `X-Request-ID` header (from client or generated) and include it in server logs to trace issues end-to-end.
- The ID should not be exposed in error messages unless it aids user support (e.g., "If this issue persists, share code ABC123 with support").

### Frontend handling recommendations
- Map status codes to user copy:
  - 400/422: Show field-level messages when `details` present; otherwise a generic banner.
  - 401: “Your session has expired. Please sign in again.” then route to login.
  - 403: “You don’t have permission to do this.”
  - 404: “We couldn’t find what you’re looking for.”
  - 409: “This item can’t be changed because it’s in use.”
  - 500: “Something went wrong. Please try again.”
- Prefer optimistic UI only when safe; reconcile on error.

### Raising errors in route handlers
- Use early returns for input validation with 400/422 and clear, user-facing messages.
- For permission checks, return 403 with a friendly message.
- For not-found, prefer 404 with the resource name when safe ("Category not found").
- For unexpected failures, throw or `next(err)` and let the global error handler respond with 500.

### Example pattern
```js
// Validate input
if (!email) return res.status(400).json({ error: "Email is required" });

// Permission check
if (req.user?.role !== 'admin') {
  return res.status(403).json({ error: "Only admins can perform this action." });
}

// Not found
if (!record) return res.status(404).json({ error: "Item not found" });

// Unexpected
try {
  // ...
} catch (err) {
  return next(err); // 500 handled globally
}
```

### Logging notes
- Incoming requests: method, URL, and safe body preview
- Outgoing responses: status, duration, and safe response preview
- Non-JSON responses still log status and duration on `finish`
- Errors: stack logged server-side; client receives user-friendly text only


