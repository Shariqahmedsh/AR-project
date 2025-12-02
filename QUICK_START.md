# 🚀 Quick Start Guide

Get your AR Cybersecurity Awareness Platform running in minutes!

## 🎯 Your Deployed Applications

- **🌐 Frontend**: [https://ar-project-frontend.onrender.com](https://ar-project-frontend.onrender.com)
- **🔧 Backend**: [https://ar-project-5ojn.onrender.com](https://ar-project-5ojn.onrender.com)

## ⚡ Quick Setup (30 seconds)

### 1. **Setup Environment**
```bash
# Use production API for development (recommended)
./scripts/setup-env.sh development
```

### 2. **Start Development**
```bash
npm run dev
```

### 3. **Open Application**
- **Local**: http://localhost:5173
- **Production**: https://ar-project-frontend.onrender.com

## 🛠️ Available Commands

### Environment Management
```bash
npm run env:dev      # Development with production API
npm run env:local    # Local backend development
npm run env:prod     # Production settings
npm run env:staging  # Staging environment
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔐 Login & Admin Access

### 1. **Login to Application**
- Go to: http://localhost:5173 (local) or https://ar-project-frontend.onrender.com
- Use existing credentials or register new account with phone number

### 2. **Access Admin Panel**
- Click "Admin Panel" button in dashboard
- View all users from production database
- Manage user accounts

## 🌍 Environment Options

| Environment | API URL | Use Case |
|-------------|---------|----------|
| **development** | https://ar-project-5ojn.onrender.com | Development with live data |
| **local** | http://localhost:5001 | Full local development |
| **production** | https://ar-project-5ojn.onrender.com | Production deployment |

## 🧪 Test Your Setup

### Test API Connection
```bash
curl https://ar-project-5ojn.onrender.com/
# Should return: {"message":"AR Project Backend API","status":"running",...}
```

### Test Frontend
1. Open http://localhost:5173
2. Try logging in or register with phone number
3. Access admin panel
4. Check browser console for API calls

## 🚨 Troubleshooting

### Common Issues

**CORS Errors:**
- Backend is configured to allow your frontend domain
- Check if API URL is correct

**Authentication Errors:**
- Ensure you're logged in
- Check if JWT token is valid

**API Connection Issues:**
- Test API endpoint: `curl https://ar-project-5ojn.onrender.com/`
- Check network connectivity

### Debug Commands
```bash
# Check current environment
cat .env

# Test API
curl $VITE_API_URL/

# Check environment variables
echo $VITE_API_URL
```

## 📱 Mobile Development

For mobile development, the app automatically uses the production API:
- API URL: https://ar-project-5ojn.onrender.com
- CORS configured for mobile apps

## 🎉 You're Ready!

Your AR Cybersecurity Awareness Platform is now configured with:

✅ **Frontend**: React app with modern UI  
✅ **Backend**: Node.js API with authentication  
✅ **Database**: PostgreSQL with user management  
✅ **Admin Panel**: Complete user management dashboard  
✅ **Deployment**: Live on Render.com  

**Next Steps:**
1. Customize the UI and features
2. Add more AR scenarios
3. Deploy to your own domain
4. Add more admin features

---

**Happy coding! 🚀**
