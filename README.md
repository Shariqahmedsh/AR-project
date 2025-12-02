# AR Cybersecurity Awareness Platform - Backend

A robust Node.js backend API for the AR Cybersecurity Awareness Platform, featuring phone number verification, user management, admin controls, and comprehensive security features.

## 🚀 Features

### 🔐 Authentication & Security
- **📱 Phone Verification**: Staged signup with MessageCentral SMS integration
- **🔑 JWT Authentication**: Access tokens with refresh token support
- **👑 Admin Management**: Role-based access control and user management
- **🛡️ Security**: CORS protection, input validation, password hashing
- **🔒 User Protection**: Admin accounts cannot be deleted

### 📊 Data Management
- **🗄️ PostgreSQL**: Robust database with Prisma ORM
- **⚡ Redis Caching**: Optional performance optimization
- **📈 User Analytics**: Statistics and progress tracking
- **🎯 Content Management**: Dynamic quiz and game content
- **🔄 Database Migrations**: Automated schema management

### 🌐 API Features
- **📡 RESTful API**: Clean, well-documented endpoints
- **🔍 Request Logging**: Comprehensive request/response logging
- **⚡ Performance**: Connection pooling and caching
- **🛠️ Error Handling**: Graceful error responses
- **📝 Input Validation**: Server-side validation for all inputs

## 🛠️ Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (optional, graceful fallback)
- **Authentication**: JWT with refresh tokens
- **SMS**: MessageCentral API for phone verification
- **Security**: bcrypt, CORS, input validation
- **Logging**: Custom request/response logger

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **Redis** (optional, for caching)
- **MessageCentral API** credentials
- **npm** or yarn

## 🔧 Installation

1. **Clone and navigate to backend**
   ```bash
   git clone <repository-url>
   cd file-integrated/AR-project-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env` file:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://user:password@localhost:5432/ar_project_db"
   
   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
   JWT_EXPIRES_IN="7d"
   REFRESH_TTL_DAYS=30
   
   # Server Configuration
   PORT=5001
   NODE_ENV=development
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://ar-project-beta.vercel.app
   
   # MessageCentral SMS Configuration
   MESSAGECENTRAL_AUTH_TOKEN=your-messagecentral-auth-token
   MESSAGECENTRAL_CUSTOMER_ID=your-customer-id
   MESSAGECENTRAL_SENDER_ID=your-sender-id
   MESSAGECENTRAL_COUNTRY_CODE=91
   
   # Optional Redis Configuration
   REDIS_URL=redis://localhost:6379
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Create admin user
   node scripts/create-admin.js
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   **Server will be available at:** `http://localhost:5001`

## 📱 MessageCentral SMS Setup

### Step 1: Get MessageCentral Credentials
1. Sign up for MessageCentral API access
2. Get your Auth Token, Customer ID, and Sender ID
3. Note your country code (default: 91 for India)

### Step 2: Configure Environment
```env
MESSAGECENTRAL_AUTH_TOKEN=your-messagecentral-auth-token
MESSAGECENTRAL_CUSTOMER_ID=your-customer-id
MESSAGECENTRAL_SENDER_ID=your-sender-id
MESSAGECENTRAL_COUNTRY_CODE=91
```

## 🔐 Authentication System

### 📱 Phone Verification Signup (Current)

**Flow:**
1. **POST** `/api/auth/register`
   - Creates user with provided password (bcrypt hashed)
   - Sends verification code via SMS

2. **POST** `/api/auth/verify-phone`
   - Verifies 6-digit code
   - Marks phone as verified
   - Account ready for login

### 🔑 Password Management

- **Direct Passwords**: Users set their password during signup
- **Password Hashing**: bcrypt with salt rounds 10
- **Password Reset**: Forgot password with SMS verification
- **Password Change**: Authenticated users can change passwords

### 👑 Admin Features

- **User Management**: View all users with complete information
- **Delete Users**: Remove non-admin users (admin protection)
- **Content Management**: Create quizzes and game content
- **Statistics**: User metrics and analytics
- **Role Protection**: Cannot delete admin accounts or self

## 📡 API Endpoints

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/admin/login` | Admin login | No |
| POST | `/api/auth/verify-phone` | Verify phone with code | No |
| POST | `/api/auth/resend-phone-code` | Resend phone verification code | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with code | No |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### 👑 Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/admin/users` | Get all users | Admin |
| DELETE | `/api/auth/admin/user/:id` | Delete user | Admin |

### 🎯 Quiz Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/quiz/categories` | Get quiz categories | No |
| GET | `/api/quiz/category/:key` | Get quiz by category | No |
| POST | `/api/quiz/admin/category` | Create/update category | Admin |
| POST | `/api/quiz/admin/question` | Create question | Admin |
| GET | `/api/quiz/admin/questions` | Get all questions | Admin |
| PUT | `/api/quiz/admin/question/:id` | Update question | Admin |
| DELETE | `/api/quiz/admin/question/:id` | Delete question | Admin |

### 🎮 Game Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/game/phishing-emails` | Get phishing emails | No |
| POST | `/api/game/admin/phishing-email` | Create phishing email | Admin |
| GET | `/api/game/admin/phishing-emails` | Get all phishing emails | Admin |
| PATCH | `/api/game/admin/phishing-email/:id` | Update phishing email | Admin |
| DELETE | `/api/game/admin/phishing-email/:id` | Delete phishing email | Admin |

## 🗄️ Database Schema

### Users Table
```sql
model User {
  id          Int      @id @default(autoincrement())
  username    String   @unique
  email       String   @unique
  password    String
  name        String?
  role        String   @default("user")
  phoneNumber String? @unique
  isPhoneVerified Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  refreshTokens      RefreshToken[]
  smsVerifications   SmsVerification[]
  passwordResets     PasswordReset[]
}
```

### Authentication Tables
```sql
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model SmsVerification {
  id        Int      @id @default(autoincrement())
  userId    Int
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordReset {
  id        Int      @id @default(autoincrement())
  userId    Int
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 🚀 Deployment

### 🌐 Render Deployment

1. **Connect Repository**
   - Connect your GitHub repository to Render
   - Select the `AR-project-backend` directory

2. **Environment Variables**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_EXPIRES_IN=7d
   REFRESH_TTL_DAYS=30
   
   # CORS
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
   
   # MessageCentral SMS
   MESSAGECENTRAL_AUTH_TOKEN=your-messagecentral-auth-token
   MESSAGECENTRAL_CUSTOMER_ID=your-customer-id
   MESSAGECENTRAL_SENDER_ID=your-sender-id
   MESSAGECENTRAL_COUNTRY_CODE=91
   
   # Optional Redis
   REDIS_URL=redis://user:password@host:port
   
   # Server
   NODE_ENV=production
   ```

3. **Build Settings**
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push --accept-data-loss`
   - **Start Command**: `npm start`
   - **Node Version**: 18.x

4. **Database Setup**
   - Create PostgreSQL database on Render
   - Use the connection string in `DATABASE_URL`
   - Run migrations automatically during build

### 🔧 Local Development

1. **Start PostgreSQL**
   ```bash
   # macOS with Homebrew
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo systemctl start postgresql
   ```

2. **Start Redis** (optional)
   ```bash
   # macOS with Homebrew
   brew services start redis
   
   # Ubuntu/Debian
   sudo systemctl start redis
   ```

3. **Run Development Server**
   ```bash
   npm start
   ```

## 🔒 Security Features

### 🛡️ Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds 10
- **Role-based Access**: Separate user and admin authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific origins

### 🔐 Admin Security
- **Separate Endpoints**: Dedicated admin authentication routes
- **Role Verification**: Server-side admin role validation
- **Protected Routes**: Admin endpoints require admin role
- **User Protection**: Cannot delete admin accounts or self
- **Secure Headers**: Proper security headers configuration

### 📱 SMS Security
- **API Authentication**: MessageCentral API token authentication
- **Code Expiration**: Verification codes expire in 15 minutes
- **Rate Limiting**: Built-in SMS sending rate limits
- **Secure Headers**: SMS security headers

## 📊 Performance Features

### ⚡ Caching (Redis)
- **User Data**: Cached user information
- **Quiz Content**: Cached quiz questions and categories
- **Game Content**: Cached phishing email data
- **Graceful Fallback**: Works without Redis

### 🔄 Connection Management
- **Database Pooling**: Prisma connection pooling
- **SMTP Pooling**: Nodemailer connection pooling
- **Rate Limiting**: Built-in rate limiting for email sending

## 🐛 Troubleshooting

### Common Issues

1. **Phone Verification Not Working**
   - Check MessageCentral credentials are correct
   - Verify phone number format (include country code)
   - Check logs for SMS errors
   - Ensure all MessageCentral environment variables are set

2. **Database Connection Issues**
   - Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
   - Run `npx prisma migrate dev` to sync schema
   - Check if PostgreSQL is running
   - Verify database exists

3. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes your frontend domain
   - Check logs for CORS debugging messages
   - Ensure frontend URL matches exactly (including https/http)

4. **Redis Connection Issues**
   - Redis is optional - app works without it
   - Check `REDIS_URL` format if using external Redis
   - Backend will log "Redis disabled" if not available

5. **JWT Token Issues**
   - Verify `JWT_SECRET` is set and secure
   - Check token expiration settings
   - Ensure refresh token cookies are working

6. **Admin Access Issues**
   - Verify admin user exists in database
   - Check user has `role: "admin"`
   - Ensure admin account is verified
   - Use correct admin credentials

## 📝 Scripts

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to database |
| `node scripts/create-admin.js` | Create admin user |

### Custom Scripts

**Create Admin User**
```bash
node scripts/create-admin.js
```

**Database Reset**
```bash
npx prisma migrate reset
npx prisma migrate dev
node scripts/create-admin.js
```

## 🔍 Logging

### Request/Response Logging
- **Incoming Requests**: Method, URL, body (sensitive data redacted)
- **Outgoing Responses**: Status code, response time, response data
- **Error Logging**: Detailed error information
- **CORS Logging**: Origin checks and decisions

### Log Format
```
➡️  POST /api/auth/register body: [redacted]
⬅️  201 POST /api/auth/register 125716ms resp: [redacted]
🔍 CORS Origin check: https://ar-project-beta.vercel.app
✅ CORS allowed for: https://ar-project-beta.vercel.app
📧 Email sent: <message-id@gmail.com>
```

## 📄 Environment Variables Reference

### Required Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

### Optional Variables
```env
PORT=5001
NODE_ENV=development
JWT_EXPIRES_IN=7d
REFRESH_TTL_DAYS=30
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com
REDIS_URL=redis://localhost:6379
```

## 🧪 Testing

### Manual Testing

1. **Authentication Flow**
   - Test user registration with email verification
   - Test admin login and access
   - Test password reset flow
   - Test JWT token refresh

2. **Admin Functions**
   - Test user management
   - Test user deletion (non-admin only)
   - Test content management
   - Test role-based access

3. **SMS System**
   - Test verification code sending
   - Test password reset SMS
   - Test SMS delivery to different carriers

4. **API Endpoints**
   - Test all CRUD operations
   - Test error handling
   - Test input validation
   - Test CORS configuration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow Node.js best practices
- Use proper error handling
- Add input validation
- Test all endpoints
- Document new features
- Maintain security standards

## 🔗 Related Documentation

- [Frontend README](../README.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Phone Verification Guide](../PHONE_VERIFICATION.md)
- [Workflow Documentation](../WORKFLOW.md)

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Test with the provided examples

---

**Built with ❤️ for cybersecurity education**