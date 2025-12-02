# AR Cybersecurity Awareness Platform

A comprehensive cybersecurity education platform featuring interactive AR scenarios, quizzes, and games. Built with React frontend and Node.js backend, featuring phone number verification, admin management, and modern UI/UX.

## 🚀 Features

### 🔐 Authentication & Security
- **📱 Phone Verification**: Signup with SMS verification codes via MessageCentral
- **🔑 Password Management**: Direct password set during signup; secure reset and change flows
- **👑 Admin Panel**: Complete user management with delete capabilities
- **🔒 Role-based Access**: JWT authentication with user/admin roles
- **🛡️ CORS Protection**: Configured for multiple deployment origins
- **🗑️ Safe User Deletion**: Proper cleanup of all related records when deleting users

### 📱 User Experience
- **📱 Responsive Design**: Mobile-first with glass effects and animations
- **🎮 Interactive Learning**: AR scenarios, quizzes, and educational games
- **🗂️ Dynamic Content**: Database-driven quizzes and game content
- **📊 Progress Tracking**: User statistics and completion tracking
- **🌐 PWA Ready**: Progressive Web App capabilities

### 🎯 Educational Content
- **📧 Phishing Detection**: Learn to identify suspicious emails through AR visualization
- **🎭 Social Engineering**: Recognize manipulation tactics with AR demonstrations
- **🔒 Ransomware Awareness**: Understand ransomware threats through AR simulation
- **📶 Public WiFi Security**: Learn about public WiFi risks with AR guidance
- **📱 Social Media Security**: Protect yourself from social media threats with AR
- **🎯 Quiz System**: Category-based knowledge testing

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom glass effects
- **UI Components**: Radix UI + Custom Components
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (optional, graceful fallback)
- **Authentication**: JWT with refresh tokens
- **SMS**: MessageCentral API for phone verification
- **Security**: CORS, bcrypt, input validation
- **Logging**: Advanced request/response logging with performance monitoring
- **Error Handling**: Comprehensive error handling with specific error codes
- **State Management**: React Hooks + Local Storage

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or yarn
- **PostgreSQL** database
- **Redis** (optional, for caching)
- **MessageCentral API** (for SMS verification)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file-integrated
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd AR-project-backend
   npm install
   cd ..
   ```

3. **Environment Setup**

   **Frontend** (`.env` in root):
   ```env
   VITE_API_URL=http://localhost:5001
   VITE_APP_TITLE=AR Cybersecurity Awareness Platform
   ```

   **Backend** (`AR-project-backend/.env`):
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/ar_project_db"
   
   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   REFRESH_TTL_DAYS=30
   
   # Server
   PORT=5001
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://ar-project-beta.vercel.app
   
   # MessageCentral SMS Configuration
   MESSAGECENTRAL_AUTH_TOKEN=your-messagecentral-auth-token
   MESSAGECENTRAL_CUSTOMER_ID=your-customer-id
   MESSAGECENTRAL_SENDER_ID=your-sender-id
   MESSAGECENTRAL_COUNTRY_CODE=91
   ```

4. **Database Setup**
   ```bash
   cd AR-project-backend
   npx prisma migrate dev
   npx prisma generate
   node scripts/create-admin.js
   cd ..
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd AR-project-backend
   npm start

   # Terminal 2 - Frontend
   npm run dev
   ```

   **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

## 🔄 Recent Updates

### 🐛 Bug Fixes & Improvements
- **Fixed User Deletion Issue**: Resolved 500 Internal Server Error when deleting users
  - Added proper cleanup of all related database records (UserProgress, QuizAttempt, ScenarioCompletion)
  - Improved error handling with specific error messages for different failure scenarios
  - Enhanced foreign key constraint handling in delete operations
- **Enhanced Error Handling**: Better error messages for admin operations
- **Database Integrity**: Ensured proper cascade deletion of user-related data

### 🔧 Backend Enhancements
- **Advanced Request Logging**: Comprehensive API request/response logging with sensitive data redaction
- **Performance Monitoring**: Request duration tracking and performance metrics
- **Enhanced CORS Configuration**: Multi-origin support with detailed logging
- **Improved SMS Integration**: MessageCentral API integration with fallback handling
- **Database Connection Management**: Prisma ORM with connection pooling and error handling
- **Redis Caching**: Optional Redis integration with graceful fallback
- **Security Headers**: Enhanced security with proper CORS, JWT, and cookie configuration

## 🚀 Quick Start

### 📱 Phone Verification Signup Flow
1. **Start Registration**: Enter username, email, and phone number
2. **Receive Code**: Check SMS for 6-digit verification code
3. **Verify Phone**: Enter the code to verify your phone number
4. **Set Password**: Create your secure password
5. **Complete**: Account ready for login

### 📚 Workflow Documentation
- For end-to-end architecture, flowcharts, and detailed system diagrams, see the comprehensive [WORKFLOW.md](./WORKFLOW.md).

### 👑 Admin Access
- **Default Admin**: `admin` / `AdminSecure123!`
- **Admin Panel**: Access at `/admin` after login
- **User Management**: View, manage, and delete users
- **Content Management**: Create quizzes and game content

### 🎮 Guest Mode
- **Limited Access**: Explore without registration
- **No Progress Saving**: Guest sessions don't persist
- **Full Content Access**: All educational content available

## 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run preview:render` | Preview for Render deployment |

## 📱 Pages & Features

### 🔐 Authentication (`/`)
- **Dual Login System**: Toggle between User and Admin login
- **User Login**: Secure user authentication with registration
- **Admin Login**: Separate admin authentication with role-based access
- **Guest Access**: Explore without registration (user mode only)
- **Role-based Routing**: Automatic redirection based on user role

### 📖 Introduction (`/introduction`)
- Platform overview and features
- Getting started guide
- Navigation to main features

### 🏠 Dashboard (`/dashboard`)
- **AR Scenarios**: Interactive cybersecurity scenarios
- **Quiz Section**: Knowledge testing
- **Games**: Educational mini-games
- **Progress Tracking**: User statistics
- **Admin Access**: Link to admin panel

### 🎯 AR Scenarios (`/ar-scenarios`)
- **📧 Phishing Email Detection**: Learn to identify suspicious emails through AR visualization
- **🎭 Social Engineering Attack**: Recognize manipulation tactics through AR demonstrations
- **🔒 Ransomware Attack Simulation**: Understand ransomware threats through AR simulation
- **📶 Public WiFi Security**: Learn about public WiFi risks through AR guidance
- **📱 Social Media Security**: Protect yourself from social media threats with AR

### 🧠 Quiz System (`/quiz/:scenario?`)
- **DB‑Driven**: Questions are fetched from the backend per category
- **Empty State**: If no questions exist, users see a clear message
- **Instant Feedback**: Real-time scoring and explanations
- **Progress Tracking**: Track quiz completion and scores

### 🎮 Interactive Games (`/game`)
- **Phishing Email Detective**: Loads phishing email entries from DB
- **Empty State**: Shows message if no game content exists
- **Hacker Hunter**: Interactive reaction game (local state)

### 👥 Admin Panel (`/admin`)
- **User Management**: View all registered users
- **Statistics Dashboard**: User metrics and analytics
- **Real-time Data**: Live user information
- **Secure Access**: Admin role authentication required
- **Role-based Access**: Only users with `role: "admin"` can access

## 🎨 UI Components

### Custom Components (`/src/components/ui/`)
- **Button**: Customizable button component
- **Card**: Content container with glass effects
- **Input**: Form input with validation styling
- **Label**: Form labels with accessibility
- **Tabs**: Tabbed navigation component
- **Toast**: Notification system
- **Toaster**: Toast container and management

### Page Components (`/src/pages/`)
- **LoginPage**: Authentication interface
- **IntroductionPage**: Platform introduction
- **Dashboard**: Main user dashboard
- **ARScenarios**: AR scenario selection
- **Quiz**: Quiz interface and logic
- **Game**: Interactive games
- **AdminPanel**: Admin dashboard

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom configuration:
- **Custom Colors**: Cyber-themed color palette
- **Glass Effects**: Modern glassmorphism design
- **Animations**: Smooth transitions and effects
- **Responsive**: Mobile-first design approach

### Vite Configuration
- **React Plugin**: Fast development with HMR
- **Build Optimization**: Production-ready builds
- **Environment Variables**: Secure configuration
 - **SPA Rewrites**: `static.json` added to serve `index.html` for deep links

## 🎯 AR Scenarios Details

### 1. 📧 Phishing Email Detection
- **Difficulty**: Beginner
- **Learning**: Email security awareness and threat identification
- **AR Features**: Visual email analysis with suspicious element highlighting
- **Model**: `phishing_email_.glb`

### 2. 🎭 Social Engineering Attack
- **Difficulty**: Intermediate
- **Learning**: Psychological manipulation tactics and resistance strategies
- **AR Features**: Manipulation technique demonstrations with threat indicators
- **Model**: `social_engineering.glb`

### 3. 🔒 Ransomware Attack Simulation
- **Difficulty**: Advanced
- **Learning**: Ransomware threat understanding and prevention strategies
- **AR Features**: Attack vector visualization and encryption process demonstration
- **Model**: `ransomware_attack2.glb`

### 4. 📶 Public WiFi Security
- **Difficulty**: Intermediate
- **Learning**: Public network security risks and safe browsing practices
- **AR Features**: Network security visualization with risk indicators
- **Model**: `public_wifi.glb`

### 5. 📱 Social Media Security
- **Difficulty**: Beginner
- **Learning**: Social media privacy protection and secure sharing practices
- **AR Features**: Privacy settings visualization and sharing risk indicators
- **Model**: `social_media.glb`

## 🎮 AR Technology & 3D Models

### 🚀 AR Capabilities
- **WebXR Support**: Immersive AR experiences on compatible devices
- **Scene Viewer**: Android AR support via Google Scene Viewer
- **Quick Look**: iOS AR support via Apple Quick Look
- **Model Viewer**: Cross-platform 3D model viewing with AR activation
- **Fallback Support**: 3D preview when AR is not available

### 📦 3D Model Assets
The platform includes 5 high-quality 3D models for AR scenarios:

| Model File | Scenario | Size | Description |
|------------|----------|------|-------------|
| `phishing_email_.glb` | Phishing Detection | 609KB | Interactive email model with threat indicators |
| `social_engineering.glb` | Social Engineering | 323KB | Manipulation tactics visualization |
| `ransomware_attack2.glb` | Ransomware Simulation | 328KB | Attack process demonstration |
| `public_wifi.glb` | Public WiFi Security | 359KB | Network security visualization |
| `social_media.glb` | Social Media Security | 288KB | Privacy settings and sharing risks |

### 🎯 AR Experience Features
- **Interactive Models**: Users can rotate, zoom, and explore 3D models
- **Threat Highlighting**: Visual indicators show security risks and vulnerabilities
- **Step-by-Step Guidance**: Progressive learning through AR demonstrations
- **Real-time Feedback**: Immediate visual feedback on security concepts
- **Cross-Platform**: Works on mobile devices with AR capabilities

## 🔐 Authentication System

### 📱 Enhanced Phone Verification Signup
1. **Step 1**: Enter username, email, phone number, and password → Backend creates account with phone verification pending
2. **Step 2**: Receive 6-digit verification code via SMS (MessageCentral API)
3. **Step 3**: Enter verification code → Phone number gets verified
4. **Step 4**: Account ready for immediate login
5. **Complete**: Full access to platform features

### 🔑 Enhanced Password Management
- **Direct Password Setting**: Users set their password during signup (no temporary passwords)
- **Password Change**: Users can change passwords after verification
- **Forgot Password**: Request reset code via SMS → Set new password
- **Secure Storage**: All passwords hashed with bcrypt (10 salt rounds)
- **Password Validation**: Minimum 6 characters required

### 👑 Admin Features
- **User Management**: View all users with complete information
- **Delete Users**: Remove non-admin users with proper data cleanup (admin protection)
- **Content Management**: Create quizzes and game content
- **Statistics**: User metrics and analytics
- **Role Protection**: Cannot delete admin accounts or self
- **Data Integrity**: Safe deletion with automatic cleanup of related records

### 🔒 Security Features
- **JWT Tokens**: 7-day access tokens with refresh tokens
- **Role-based Access**: Separate user/admin authentication
- **CORS Protection**: Configured for multiple deployment origins
- **Input Validation**: Server-side validation for all inputs
- **Phone Verification**: Required for all new accounts

## 📊 Admin Panel Features

- **User Statistics**: Total users, active users, new users this week
- **User Table**: Complete user information display
- **Real-time Updates**: Refresh user data
- **Secure Access**: JWT-based authentication with admin role
- **Responsive Design**: Works on all devices
- **Role Management**: View and manage user roles
- **Admin Dashboard**: Comprehensive admin interface

## 🚀 Deployment

### 🌐 Frontend Deployment (Vercel)

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Environment Variables** (Vercel Dashboard)
```env
   VITE_API_URL=https://ar-project-backend.onrender.com
   ```

4. **SPA Routing** (`vercel.json` - already configured)
   ```json
   {
     "rewrites": [
       {
         "source": "/((?!api).*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 🔧 Backend Deployment (Render)

1. **Environment Variables** (Render Dashboard)
```env
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
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
   ```

2. **Build Command**
   ```bash
   npm install && npx prisma generate && npx prisma db push --accept-data-loss
   ```

3. **Start Command**
   ```bash
   npm start
   ```

### 📱 MessageCentral SMS Setup

1. **Get MessageCentral Credentials**:
   - Sign up for MessageCentral API access
   - Get your Auth Token, Customer ID, and Sender ID
2. **Configure Environment Variables**:
   - Set `MESSAGECENTRAL_AUTH_TOKEN` with your auth token
   - Set `MESSAGECENTRAL_CUSTOMER_ID` with your customer ID
   - Set `MESSAGECENTRAL_SENDER_ID` with your sender ID
   - Set `MESSAGECENTRAL_COUNTRY_CODE` (default: 91 for India)

### 🔒 Security Configuration

- **CORS**: Configure `ALLOWED_ORIGINS` with your frontend domains
- **JWT Secret**: Use a strong, random secret key
- **Database**: Use connection pooling and SSL in production
- **Redis**: Optional but recommended for caching

## 🔐 Enhanced Login Interface

### User Login Features
- **Dual Authentication**: Username/email and password authentication
- **Phone Verification Enforcement**: Must verify phone before login access
- **Smart Routing**: Automatic redirection based on verification status
- **Guest Access**: Explore platform without registration
- **Form Validation**: Real-time input validation with error messages
- **Password Visibility**: Toggle password visibility for better UX
- **Responsive Design**: Mobile-first design with glass effects

### Admin Login Features
- **Role-Based Access**: Separate admin authentication with role verification
- **Admin Credentials**: Username and password authentication
- **Visual Distinction**: Amber/orange theme for admin interface
- **Credential Display**: Default admin credentials shown
- **Server-Side Validation**: Backend role verification for security
- **JWT Token Management**: Secure token-based authentication
- **Admin Panel Access**: Direct routing to admin dashboard

### Enhanced Authentication Flow
- **Unified Interface**: Single page with toggle between user and admin modes
- **Visual Indicators**: Clear distinction between login types
- **Smart Error Handling**: Specific error messages for different failure scenarios
- **Phone Verification Integration**: Seamless integration with SMS verification
- **Session Management**: Persistent login with refresh token support
- **Security Features**: CORS protection, input validation, and secure headers

## 🔌 API Endpoints & Backend Features

### 🔐 Authentication Endpoints
- **POST `/api/auth/register`**: User registration with phone verification
- **POST `/api/auth/login`**: User login with phone verification check
- **POST `/api/auth/admin/login`**: Admin-specific login endpoint
- **POST `/api/auth/verify-phone`**: Phone number verification
- **POST `/api/auth/resend-phone-code`**: Resend verification SMS
- **POST `/api/auth/forgot-password`**: Password reset via SMS
- **POST `/api/auth/reset-password`**: Set new password with SMS code
- **POST `/api/auth/change-password`**: Change password (authenticated users)
- **POST `/api/auth/refresh`**: Refresh JWT tokens
- **POST `/api/auth/logout`**: Logout and revoke refresh tokens

### 👑 Admin Endpoints
- **GET `/api/auth/admin/users`**: Get all users (admin only)
- **DELETE `/api/auth/admin/user/:id`**: Delete user with proper cleanup (admin only)
- **POST `/api/auth/admin/verify-user`**: Manually verify user (admin only)
- **POST `/api/auth/create-admin`**: Create admin user (setup only)
- **POST `/api/auth/manual-verify-admin`**: Make user admin (testing only)

### 🔧 Backend Features
- **Request Logging**: Comprehensive API logging with sensitive data redaction
- **Performance Monitoring**: Request duration tracking and metrics
- **Error Handling**: Specific error codes (P2003, P2025) with detailed messages
- **Database Cleanup**: Proper foreign key constraint handling
- **SMS Integration**: MessageCentral API with fallback handling
- **Security Headers**: CORS, JWT, and cookie security configuration
- **Connection Management**: Prisma ORM with connection pooling

## 📁 Project Structure

```
AR-project/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   ├── ProtectedRoute.jsx     # Route protection component
│   │   ├── CallToAction.jsx       # Call-to-action component
│   │   ├── HeroImage.jsx          # Hero image component
│   │   └── WelcomeMessage.jsx     # Welcome message component
│   ├── lib/
│   │   ├── api.js                 # API configuration
│   │   └── utils.js               # Utility functions
│   ├── pages/
│   │   ├── LoginPage.jsx          # Dual authentication page
│   │   ├── IntroductionPage.jsx   # Platform introduction
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── ARScenarios.jsx        # AR scenarios page
│   │   ├── Quiz.jsx               # Quiz interface
│   │   ├── Game.jsx               # Interactive games
│   │   └── AdminPanel.jsx         # Admin dashboard
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # App entry point
│   └── index.css                  # Global styles
├── AR-project-backend/
│   ├── routes/
│   │   └── authRoutes.js          # Authentication routes
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── scripts/
│   │   └── create-admin.js        # Admin user creation
│   └── server.js                  # Backend server
└── README.md                      # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue to Purple gradients
- **Secondary**: Green to Blue gradients
- **Accent**: Purple to Pink gradients
- **Background**: Dark slate with gradients
- **Glass Effects**: Semi-transparent overlays

### Typography
- **Headings**: Bold, cyber-themed fonts
- **Body**: Clean, readable sans-serif
- **Code**: Monospace for technical content

### Animations
- **Page Transitions**: Smooth fade and slide effects
- **Hover Effects**: Interactive element feedback
- **Loading States**: Engaging loading animations
- **Micro-interactions**: Subtle feedback animations

## 🧪 Testing

### Manual Testing
1. **Authentication**: Test login, registration, logout
2. **Navigation**: Verify all routes work correctly
3. **Responsive**: Test on different screen sizes
4. **Admin Panel**: Verify admin functionality
5. **Quizzes**: Ensure DB contains questions (Admin → Quiz Management)
6. **Games**: Ensure DB contains phishing emails (Admin → Game Content)
7. **Phone Verification**: Register a new user → enter SMS code → verify success
8. **Forgot Password**: Request SMS code → reset with code and new password
5. **AR Scenarios**: Test all scenario interactions

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Responsive design

## 🐛 Troubleshooting

### Common Issues

1. **Phone Verification Not Working**
   - Check MessageCentral credentials are correct
   - Verify phone number format (include country code)
   - Check backend logs for SMS errors
   - Ensure all MessageCentral environment variables are set

2. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes your frontend domain
   - Check backend logs for CORS debugging messages
   - Ensure frontend URL matches exactly (including https/http)

3. **Database Connection Issues**
   - Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
   - Run `npx prisma migrate dev` to sync schema
   - Check if PostgreSQL is running

4. **Redis Connection Issues**
   - Redis is optional - app works without it
   - Check `REDIS_URL` format if using external Redis
   - Backend will log "Redis disabled" if not available

5. **Build Errors**
   - Check Node.js version (v18+)
   - Clear node_modules and reinstall
   - Verify all dependencies are installed

6. **Authentication Issues**
   - Check JWT token validity
   - Verify localStorage permissions
   - Clear browser cache and cookies
   - Verify admin credentials are correct
   - Check if user has admin role in database

7. **User Deletion Issues**
   - Fixed: 500 error when deleting users is now resolved
   - All related records (progress, quiz attempts, scenarios) are properly cleaned up
   - Enhanced error messages provide specific feedback for deletion failures
   - Foreign key constraints are properly handled during user deletion

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new components (optional)
- Maintain consistent styling with Tailwind
- Test on multiple devices and browsers
- Document new features and components

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for all passwords
- **Role-based Access**: Separate user and admin authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for API security

### Admin Security
- **Separate Endpoints**: Dedicated admin authentication routes
- **Role Verification**: Server-side admin role validation
- **Protected Routes**: Admin panel requires admin role
- **Default Credentials**: Pre-configured admin account for initial setup
- **Password Change**: Admin should change default password

### Data Protection
- **Environment Variables**: Sensitive data in environment files
- **Database Security**: Prisma ORM with parameterized queries
- **Token Expiration**: JWT tokens expire after 7 days
- **Secure Headers**: Proper security headers configuration

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the component documentation
- Test with the provided examples

---

**Built with ❤️ for cybersecurity education**

## 🔗 Related Documentation

- [Backend API Documentation](../AR-project-backend/README.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Component Library](./src/components/ui/)
- [Workflow Documentation](./WORKFLOW.md)
