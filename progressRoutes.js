import express from "express";
import prisma from "../prisma/client.js";
import redis from "../redis/client.js";
import { authenticateToken } from "./authRoutes.js";

const router = express.Router();

// Get user progress
router.get("/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get or create user progress
    let progress = await prisma.userProgress.findUnique({
      where: { userId }
    });
    
    if (!progress) {
      progress = await prisma.userProgress.create({
        data: { userId }
      });
    }
    
    // Get completed scenarios count
    const scenariosCompleted = await prisma.scenarioCompletion.count({
      where: { userId, completed: true }
    });
    
    // Get passed quizzes count (score >= 80%)
    const quizzesPassed = await prisma.quizAttempt.count({
      where: { 
        userId, 
        passed: true 
      }
    });
    
    // Update progress if counts changed
    if (progress.scenariosCompleted !== scenariosCompleted || 
        progress.quizzesPassed !== quizzesPassed) {
      progress = await prisma.userProgress.update({
        where: { userId },
        data: {
          scenariosCompleted,
          quizzesPassed,
          lastUpdated: new Date()
        }
      });
    }
    
    res.json({
      scenariosCompleted: progress.scenariosCompleted,
      quizzesPassed: progress.quizzesPassed,
      totalScore: progress.totalScore,
      lastUpdated: progress.lastUpdated
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Record quiz attempt
router.post("/quiz-attempt", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { categoryKey, score, totalQuestions, timeSpent, answers } = req.body;
    
    if (!categoryKey || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const passed = (score / totalQuestions) >= 0.8; // 80% threshold
    
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        categoryKey,
        score,
        totalQuestions,
        passed,
        timeSpent,
        answers: answers ? JSON.stringify(answers) : null
      }
    });
    
    // Update user progress
    await updateUserProgress(userId);
    
    res.json({
      message: "Quiz attempt recorded",
      attempt: {
        id: attempt.id,
        passed: attempt.passed,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions
      }
    });
  } catch (error) {
    console.error("Quiz attempt error:", error);
    res.status(500).json({ error: "Failed to record quiz attempt" });
  }
});

// Record scenario completion
router.post("/scenario-completion", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scenarioKey, score, timeSpent } = req.body;
    
    if (!scenarioKey) {
      return res.status(400).json({ error: "Missing scenario key" });
    }
    
    const completion = await prisma.scenarioCompletion.upsert({
      where: {
        userId_scenarioKey: {
          userId,
          scenarioKey
        }
      },
      update: {
        completed: true,
        score,
        timeSpent,
        updatedAt: new Date()
      },
      create: {
        userId,
        scenarioKey,
        completed: true,
        score,
        timeSpent
      }
    });
    
    // Update user progress
    await updateUserProgress(userId);
    
    res.json({
      message: "Scenario completion recorded",
      completion: {
        id: completion.id,
        scenarioKey: completion.scenarioKey,
        completed: completion.completed,
        score: completion.score
      }
    });
  } catch (error) {
    console.error("Scenario completion error:", error);
    res.status(500).json({ error: "Failed to record scenario completion" });
  }
});

// Get user's quiz attempts
router.get("/quiz-attempts", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { categoryKey } = req.query;
    
    const where = { userId };
    if (categoryKey) {
      where.categoryKey = categoryKey;
    }
    
    const attempts = await prisma.quizAttempt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent attempts
    });
    
    res.json({ attempts });
  } catch (error) {
    console.error("Get quiz attempts error:", error);
    res.status(500).json({ error: "Failed to fetch quiz attempts" });
  }
});

// Get user's scenario completions
router.get("/scenario-completions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const completions = await prisma.scenarioCompletion.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json({ completions });
  } catch (error) {
    console.error("Get scenario completions error:", error);
    res.status(500).json({ error: "Failed to fetch scenario completions" });
  }
});

// Admin endpoint to get all user progress
router.get("/admin/all-progress", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get all users with their progress
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        progress: {
          select: {
            scenariosCompleted: true,
            quizzesPassed: true,
            totalScore: true,
            lastUpdated: true
          }
        },
        scenarioCompletions: {
          select: {
            scenarioKey: true,
            completed: true,
            updatedAt: true
          }
        },
        quizAttempts: {
          select: {
            categoryKey: true,
            score: true,
            totalQuestions: true,
            passed: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Last 5 attempts
        }
      }
    });
    
    // Format the data
    const progressData = users.map(user => ({
      userId: user.id,
      username: user.username,
      email: user.email,
      scenariosCompleted: user.progress?.[0]?.scenariosCompleted || 0,
      quizzesPassed: user.progress?.[0]?.quizzesPassed || 0,
      totalScore: user.progress?.[0]?.totalScore || 0,
      lastActivity: user.progress?.[0]?.lastUpdated || user.createdAt,
      completedScenarios: user.scenarioCompletions
        .filter(sc => sc.completed)
        .map(sc => sc.scenarioKey),
      recentQuizAttempts: user.quizAttempts
    }));
    
    res.json(progressData);
  } catch (error) {
    console.error("Get all progress error:", error);
    res.status(500).json({ error: "Failed to fetch progress data" });
  }
});

// Helper function to update user progress
async function updateUserProgress(userId) {
  try {
    // Get completed scenarios count
    const scenariosCompleted = await prisma.scenarioCompletion.count({
      where: { userId, completed: true }
    });
    
    // Get passed quizzes count
    const quizzesPassed = await prisma.quizAttempt.count({
      where: { userId, passed: true }
    });
    
    // Calculate total score from all quiz attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { score: true }
    });
    
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    
    // Update or create progress record
    await prisma.userProgress.upsert({
      where: { userId },
      update: {
        scenariosCompleted,
        quizzesPassed,
        totalScore,
        lastUpdated: new Date()
      },
      create: {
        userId,
        scenariosCompleted,
        quizzesPassed,
        totalScore
      }
    });
    
    // Clear Redis cache if available
    if (redis.isOpen) {
      await redis.del(`progress:${userId}`).catch(() => {});
    }
  } catch (error) {
    console.error("Update progress error:", error);
  }
}

export default router;
