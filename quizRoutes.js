import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "./authRoutes.js";

const router = express.Router();

// Public: get list of categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.quizCategory.findMany({
      orderBy: { id: "asc" },
      select: { id: true, key: true, title: true, description: true }
    });
    res.json({ categories });
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Public: get questions for a category key
router.get("/category/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const category = await prisma.quizCategory.findUnique({
      where: { key },
      include: {
        questions: {
          orderBy: { id: "asc" },
          include: { options: { orderBy: { id: "asc" } } }
        }
      }
    });
    if (!category) return res.status(404).json({ error: "Category not found" });

    // normalize payload for frontend
    const payload = {
      key: category.key,
      title: category.title,
      description: category.description || "",
      questions: category.questions.map((q) => ({
        id: q.id,
        question: q.question,
        explanation: q.explanation || "",
        options: q.options.map((o) => o.text),
        correctIndex: Math.max(0, q.options.findIndex((o) => o.isCorrect))
      }))
    };
    res.json(payload);
  } catch (err) {
    console.error("Fetch questions error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Admin: create/update category
router.post("/admin/category", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const { key, title, description } = req.body;
    if (!key || !title) return res.status(400).json({ error: "key and title are required" });
    const upserted = await prisma.quizCategory.upsert({
      where: { key },
      update: { title, description },
      create: { key, title, description }
    });
    res.status(201).json(upserted);
  } catch (err) {
    console.error("Upsert category error:", err);
    res.status(500).json({ error: "Failed to save category" });
  }
});

// Admin: create question with options
router.post("/admin/question", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const { categoryKey, question, explanation, options, correctIndex } = req.body;
    if (!categoryKey || !question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "categoryKey, question and at least 2 options required" });
    }
    if (correctIndex == null || correctIndex < 0 || correctIndex >= options.length) {
      return res.status(400).json({ error: "valid correctIndex required" });
    }
    const category = await prisma.quizCategory.findUnique({ where: { key: categoryKey } });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const created = await prisma.quizQuestion.create({
      data: {
        question,
        explanation: explanation || null,
        categoryId: category.id,
        options: {
          create: options.map((text, idx) => ({ text, isCorrect: idx === correctIndex }))
        }
      },
      include: { options: true }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Create question error:", err);
    res.status(500).json({ error: "Failed to create question" });
  }
});

// Admin: get all quiz questions with categories
router.get("/admin/questions", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const questions = await prisma.quizQuestion.findMany({
      include: {
        category: {
          select: { key: true, title: true }
        },
        options: {
          orderBy: { id: "asc" }
        }
      },
      orderBy: [
        { category: { key: "asc" } },
        { id: "asc" }
      ]
    });

    res.json({ questions });
  } catch (err) {
    console.error("Admin fetch questions error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Admin: delete a quiz question
router.delete("/admin/question/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    // Delete child options first, then the question, to satisfy FK constraints
    await prisma.$transaction([
      prisma.quizOption.deleteMany({ where: { questionId } }),
      prisma.quizQuestion.delete({ where: { id: questionId } })
    ]);

    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Admin delete question error:", err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: "Question not found" });
    } else if (err.code === 'P2003') {
      // FK constraint error (should be avoided by the transaction above)
      res.status(409).json({ error: "Cannot delete question due to related records" });
    } else {
      res.status(500).json({ error: "Failed to delete question" });
    }
  }
});

// Admin: update a quiz question and its options
router.put("/admin/question/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) return res.status(400).json({ error: "Invalid question ID" });

    const { question, explanation, options, correctIndex, categoryKey } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "question and at least 2 options required" });
    }
    if (correctIndex == null || correctIndex < 0 || correctIndex >= options.length) {
      return res.status(400).json({ error: "valid correctIndex required" });
    }

    let categoryId;
    if (categoryKey) {
      const category = await prisma.quizCategory.findUnique({ where: { key: categoryKey } });
      if (!category) return res.status(404).json({ error: "Category not found" });
      categoryId = category.id;
    }

    // Replace options to keep logic simple
    const updated = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        question,
        explanation: explanation || null,
        ...(categoryId ? { categoryId } : {}),
        options: {
          deleteMany: {},
          create: options.map((text, idx) => ({ text, isCorrect: idx === correctIndex }))
        }
      },
      include: { options: true, category: { select: { key: true, title: true } } }
    });

    res.json(updated);
  } catch (err) {
    console.error("Update question error:", err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: "Question not found" });
    } else {
      res.status(500).json({ error: "Failed to update question" });
    }
  }
});

export default router;


