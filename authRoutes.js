import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prisma/client.js";
import redis from "../redis/client.js";
import { sendSmsVerificationCode, sendPasswordResetSms, validateOtp } from "../env-configs/sms-service.js";

const router = express.Router();

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TTL_DAYS || '30', 10);

function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString('hex');
}

async function issueRefreshToken(res, userId) {
  const token = generateRefreshTokenValue();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });
}

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name, phoneNumber } = req.body;

    // Validate required fields
    if (!username || !email || !password || !phoneNumber) {
      return res.status(400).json({ 
        error: "Username, email, password, and phoneNumber are required" 
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = String(phoneNumber).trim();

    // Check if username already exists
    const existingByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingByUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
    // Check if email already exists (normalized)
    const existingByEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingByEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Check if phone already exists
    const existingByPhone = await prisma.user.findUnique({ where: { phoneNumber: normalizedPhone } });
    if (existingByPhone) {
      return res.status(400).json({ error: "Phone number already in use" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user (phone not verified yet)
    const user = await prisma.user.create({
      data: {
        username,
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        password: hashedPassword,
        name: name || username,
        isPhoneVerified: false
      }
    });

    // Send SMS via MessageCentral VerifyNow (generates its own code)
    const smsResult = await sendPasswordResetSms(normalizedPhone); // Use same function as forgot password
    if (!smsResult.success) {
      console.error("📱 Failed to send verification SMS:", smsResult.error);
    } else {
      console.log(`📱 SMS sent via MessageCentral VerifyNow (ID: ${smsResult.messageId || "n/a"})`);
    }

    // Clear users cache
    if (redis.isOpen) {
      await redis.del("users:all");
    }

    res.status(201).json({
      message: "User created successfully. Please verify your phone to sign in.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isPhoneVerified: user.isPhoneVerified
      },
      verificationId: smsResult?.verificationId || undefined
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: "Username and password are required" 
      });
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    // Enforce phone verification before login
    if (!user.isPhoneVerified) {
      return res.status(403).json({ 
        error: "Phone verification required",
        requiresPhoneVerification: true,
        phoneNumber: user.phoneNumber
      });
    }

    const token = createAccessToken({ userId: user.id, username: user.username, role: user.role });
    await issueRefreshToken(res, user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Admin login endpoint
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: "Username and password are required" 
      });
    }

    // Find admin user by username or email
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: username },
              { email: username }
            ]
          },
          { role: "admin" }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: "Invalid admin credentials" 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Invalid admin credentials" 
      });
    }

    const token = createAccessToken({ userId: user.id, username: user.username, role: user.role });
    await issueRefreshToken(res, user.id);

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Admin login failed" });
  }
});

// Verify token middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        isPhoneVerified: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Change password endpoint
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Current password and new password are required" 
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: "New password must be at least 6 characters long" 
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Current password is incorrect" 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword }
    });

    // Clear user cache
    if (redis.isOpen) {
      await redis.del("users:all");
      await redis.del(`user:${req.user.userId}`);
    }

    res.json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Admin endpoint to get all users with passwords (admin only)
router.get("/admin/users", async (req, res) => {
  try {
    // Check if user is admin
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get all users with their passwords
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        password: true,
        name: true,
        role: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin endpoint to delete a non-admin user by ID (admin only)
router.delete('/admin/user/:id', async (req, res) => {
  try {
    // Authenticate and ensure admin
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const adminUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const targetUserId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    // Prevent deleting admin accounts and optionally self-protection
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (targetUser.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }
    if (targetUserId === adminUser.id) {
      return res.status(400).json({ error: 'Admins cannot delete themselves' });
    }

    // Cleanup all related records (best-effort)
    await prisma.refreshToken.deleteMany({ where: { userId: targetUserId } }).catch(() => {});
    await prisma.smsVerification.deleteMany({ where: { userId: targetUserId } }).catch(() => {});
    await prisma.passwordReset.deleteMany({ where: { userId: targetUserId } }).catch(() => {});
    await prisma.userProgress.deleteMany({ where: { userId: targetUserId } }).catch(() => {});
    await prisma.quizAttempt.deleteMany({ where: { userId: targetUserId } }).catch(() => {});
    await prisma.scenarioCompletion.deleteMany({ where: { userId: targetUserId } }).catch(() => {});

    await prisma.user.delete({ where: { id: targetUserId } });

    if (redis.isOpen) {
      await redis.del('users:all').catch(() => {});
      await redis.del(`user:${targetUserId}`).catch(() => {});
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    
    // Provide more specific error messages based on the error type
    if (error.code === 'P2003') {
      return res.status(500).json({ error: 'Cannot delete user due to foreign key constraints' });
    } else if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    } else {
      return res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
  }
});

export default router;

// Phone verification endpoints
router.post('/verify-phone', async (req, res) => {
  try {
    const { phoneNumber, code, verificationId } = req.body;
    if (!phoneNumber || !code || !verificationId) return res.status(400).json({ error: 'phoneNumber, code and verificationId are required' });

    const user = await prisma.user.findUnique({ where: { phoneNumber: String(phoneNumber).trim() } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Always validate via MessageCentral VerifyNow
    const result = await validateOtp({ verificationId, code });
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Invalid or expired code' });
    }

    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { 
        isPhoneVerified: true
      } 
    });
    return res.json({ message: 'Phone verified successfully' });
  } catch (e) {
    console.error('Verify phone error:', e);
    res.status(500).json({ error: 'Failed to verify phone' });
  }
});

router.post('/resend-phone-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' });

    const normalizedPhone = String(phoneNumber).trim();
    const user = await prisma.user.findUnique({ where: { phoneNumber: normalizedPhone } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isPhoneVerified) return res.json({ message: 'Phone already verified' });

    // Send SMS via MessageCentral VerifyNow (generates its own code)
    const smsResult = await sendPasswordResetSms(normalizedPhone); // Use same function as forgot password
    if (!smsResult.success) {
      console.error('📱 Failed to resend verification SMS:', smsResult.error);
      return res.json({ message: 'SMS service temporarily unavailable. Please try again later.', verificationId: undefined });
    }
    return res.json({ message: 'Verification code sent', verificationId: smsResult?.verificationId || undefined });
  } catch (e) {
    console.error('Resend phone code error:', e);
    res.status(500).json({ error: 'Failed to resend code' });
  }
});

// Request password reset code via SMS (using MessageCentral VerifyNow)
router.post('/forgot-password', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });
    const normalizedPhone = String(phoneNumber).trim();
    const user = await prisma.user.findUnique({ where: { phoneNumber: normalizedPhone } });
    // For privacy, always return success
    if (!user) return res.json({ message: 'If the phone number exists, a code has been sent' });
    
    // Use MessageCentral VerifyNow (same as signup flow)
    const smsResult = await sendPasswordResetSms(normalizedPhone);
    if (!smsResult.success) {
      console.error('📱 Failed to send password reset SMS:', smsResult.error);
    }
    return res.json({ 
      message: 'If the phone number exists, a code has been sent',
      verificationId: smsResult?.verificationId || undefined
    });
  } catch (e) {
    console.error('Forgot password error:', e);
    res.status(500).json({ message: 'Unable to process request' });
  }
});

// Verify reset code and set new password (using MessageCentral VerifyNow)
router.post('/reset-password', async (req, res) => {
  try {
    const { phoneNumber, code, newPassword, verificationId } = req.body;
    if (!phoneNumber || !code || !newPassword) return res.status(400).json({ message: 'Phone number, code and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    
    const normalizedPhone = String(phoneNumber).trim();
    const user = await prisma.user.findUnique({ where: { phoneNumber: normalizedPhone } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Use MessageCentral VerifyNow validation (same as signup flow)
    if (verificationId) {
      const result = await validateOtp({ verificationId, code });
      if (!result.success) {
        return res.status(400).json({ message: result.error || 'Invalid or expired code' });
      }
    } else {
      // Fallback to database validation if no verificationId
      const record = await prisma.passwordReset.findFirst({ where: { userId: user.id, code }, orderBy: { id: 'desc' } });
      if (!record) return res.status(400).json({ message: 'Invalid code' });
      if (new Date(record.expiresAt) < new Date()) return res.status(400).json({ message: 'Code expired' });
    }
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    
    // Clean up password reset records
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } }).catch(() => {});
    
    return res.json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error('Reset password error:', e);
    res.status(500).json({ message: 'Unable to reset password' });
  }
});
// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const rt = req.cookies?.[REFRESH_COOKIE];
    if (!rt) return res.status(401).json({ error: 'No refresh token' });
    const record = await prisma.refreshToken.findUnique({ where: { token: rt } });
    if (!record || record.revokedAt || new Date(record.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    const token = createAccessToken({ userId: user.id, username: user.username, role: user.role });
    res.json({ token });
  } catch (e) {
    console.error('Refresh error:', e);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout: revoke refresh token
router.post('/logout', async (req, res) => {
  try {
    const rt = req.cookies?.[REFRESH_COOKIE];
    if (rt) {
      await prisma.refreshToken.update({
        where: { token: rt },
        data: { revokedAt: new Date() }
      }).catch(() => {});
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.json({ message: 'Logged out' });
  } catch (e) {
    res.json({ message: 'Logged out' });
  }
});

// Temporary endpoint to manually verify user (for testing purposes)
router.post('/manual-verify', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { isPhoneVerified: true } 
    });
    
    res.json({ message: 'User manually verified successfully' });
  } catch (e) {
    console.error('Manual verify error:', e);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Create admin user endpoint (for initial setup)
router.post('/create-admin', async (req, res) => {
  try {
    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { role: 'admin' }
    });
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('AdminSecure@123', 10);
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@arcyberguard.com',
        phoneNumber: '9999999999',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'admin',
        isPhoneVerified: true
      }
    });
    
    res.json({ 
      message: 'Admin user created successfully',
      admin: {
        username: admin.username,
        email: admin.email,
        phone: admin.phoneNumber,
        id: admin.id
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Manual verify and make admin (for testing)
router.post('/manual-verify-admin', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Make user admin and verify
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'admin',
        isPhoneVerified: true
      }
    });
    
    res.json({ 
      message: 'User made admin and verified successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Manual verify admin error:', error);
    res.status(500).json({ error: 'Failed to make user admin' });
  }
});

// Admin endpoint to verify any user by email (admin only)
router.post('/admin/verify-user', async (req, res) => {
  try {
    // Check if user is admin
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { isPhoneVerified: true } 
    });
    
    res.json({ message: 'User verified successfully', user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    console.error('Admin verify user error:', e);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});
