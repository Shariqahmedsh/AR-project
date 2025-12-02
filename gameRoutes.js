import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "./authRoutes.js";

const router = express.Router();

// Public: get phishing emails (active only)
router.get('/phishing-emails', async (req, res) => {
  try {
    const emails = await prisma.phishingEmail.findMany({
      where: { active: true },
      orderBy: { id: 'asc' }
    });
    res.json({ emails });
  } catch (e) {
    console.error('Fetch phishing emails error:', e);
    res.status(500).json({ error: 'Failed to fetch phishing emails' });
  }
});

// Admin: create phishing email entry
router.post('/admin/phishing-email', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { sender, subject, content, isPhishing = true, indicators = [], active = true } = req.body;
    if (!sender || !subject || !content) return res.status(400).json({ error: 'sender, subject, content required' });
    const created = await prisma.phishingEmail.create({
      data: { sender, subject, content, isPhishing, indicators, active }
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('Create phishing email error:', e);
    res.status(500).json({ error: 'Failed to create phishing email' });
  }
});

// Admin: toggle active or update
router.patch('/admin/phishing-email/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const id = parseInt(req.params.id, 10);
    const { sender, subject, content, isPhishing, indicators, active } = req.body;
    const updated = await prisma.phishingEmail.update({
      where: { id },
      data: { sender, subject, content, isPhishing, indicators, active }
    });
    res.json(updated);
  } catch (e) {
    console.error('Update phishing email error:', e);
    res.status(500).json({ error: 'Failed to update phishing email' });
  }
});

// Admin: list all phishing emails
router.get('/admin/phishing-emails', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const emails = await prisma.phishingEmail.findMany({ orderBy: { id: 'asc' } });
    res.json({ emails });
  } catch (e) {
    console.error('Admin list phishing emails error:', e);
    res.status(500).json({ error: 'Failed to fetch phishing emails' });
  }
});

// Admin: delete phishing email
router.delete('/admin/phishing-email/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const id = parseInt(req.params.id, 10);
    await prisma.phishingEmail.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Delete phishing email error:', e);
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Failed to delete phishing email' });
  }
});

export default router;


