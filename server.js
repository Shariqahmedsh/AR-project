import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import prisma from "./prisma/client.js";
import redis, { ensureRedisConnection } from "./redis/client.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.0.111:5173',
  'http://192.168.106.213:5173',
  'https://ar-cybersecurity.netlify.app',
  'https://ar-project-beta.vercel.app',
  'https://ar-project-mocha.vercel.app'
].join(',')).split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Origin check:', origin);
    console.log('🔍 Allowed origins:', allowedOrigins);
    if (!origin) return callback(null, true); // allow server-to-server, curl, etc.
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for:', origin);
      return callback(null, true);
    }
    console.log('❌ CORS blocked for:', origin);
    return callback(null, false);
  },
  credentials: true
}));

// Optional: handle preflight for any route
app.options('*', cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Preflight check:', origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS preflight allowed for:', origin);
      return callback(null, true);
    }
    console.log('❌ CORS preflight blocked for:', origin);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request/Response logger (redacts sensitive auth payloads)
app.use((req, res, next) => {
  const startTimeMs = Date.now();
  const url = req.originalUrl || req.url;
  const isSensitive =
    url.startsWith('/api/auth') ||
    (req.body && (req.body.password || req.body.currentPassword || req.body.newPassword));

  const safeBody = isSensitive ? '[redacted]' : req.body;
  try {
    console.log('➡️ ', req.method, url, 'body:', JSON.stringify(safeBody));
  } catch {
    console.log('➡️ ', req.method, url, 'body: [unserializable]');
  }

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    const durationMs = Date.now() - startTimeMs;
    try {
      const preview = isSensitive ? '[redacted]' : JSON.stringify(payload)?.slice(0, 800);
      console.log('⬅️ ', res.statusCode, req.method, url, `${durationMs}ms`, 'resp:', preview);
    } catch {
      console.log('⬅️ ', res.statusCode, req.method, url, `${durationMs}ms`, 'resp: [unserializable]');
    }
    return originalJson(payload);
  };

  res.on('finish', () => {
    // In case response wasn't JSON (e.g., sendStatus, send), still log duration
    const durationMs = Date.now() - startTimeMs;
    if (res.getHeader('content-type')?.toString().includes('application/json')) return;
    console.log('⬅️ ', res.statusCode, req.method, url, `${durationMs}ms`);
  });

  next();
});

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "AR Project Backend API", 
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/progress", progressRoutes);

// Global error handler to log and standardize error responses
app.use((err, req, res, next) => {
  try {
    const url = req.originalUrl || req.url;
    console.error("💥 Error handling", req.method, url, "=>", err && err.stack ? err.stack : err);
  } catch (e) {
    console.error("💥 Error logging failure", e);
  }
  if (res.headersSent) return next(err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : "Internal server error";
  res.status(status).json({ error: message });
});

// Startup
async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected");
  } catch (err) {
    console.error("❌ Prisma connection failed:", err);
    process.exit(1);
  }

  // Connect to Redis
  try {
    await ensureRedisConnection();
    console.log("✅ Redis connected");
  } catch (err) {
    console.warn("⚠️ Redis connection failed:", err.message);
    console.log("⚠️ Continuing without Redis (caching disabled)");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Auth endpoints available at http://localhost:${PORT}/api/auth`);
    console.log(`🧩 Quiz endpoints available at http://localhost:${PORT}/api/quiz`);
    console.log(`🎮 Game endpoints available at http://localhost:${PORT}/api/game`);
  });
}

start();

