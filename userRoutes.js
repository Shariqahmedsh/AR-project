import express from "express";
import prisma from "../prisma/client.js";
import redis from "../redis/client.js";
import { authenticateToken } from "./authRoutes.js";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const cacheKey = "users:all";
    if (redis.isOpen) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    const users = await prisma.user.findMany();
    if (redis.isOpen) {
      await redis.set(cacheKey, JSON.stringify(users), { EX: 60 });
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create user
router.post("/", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({ data: { name, email } });
    if (redis.isOpen) {
      await redis.del("users:all");
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
});

// Admin route to get all users (requires authentication)
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    const cacheKey = "admin:users:all";
    if (redis.isOpen) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    
    // Get all users with sensitive data excluded
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (redis.isOpen) {
      await redis.set(cacheKey, JSON.stringify(users), { EX: 300 }); // 5 minutes cache
    }
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (err) {
    console.error("Admin users fetch error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
