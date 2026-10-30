import { Router } from 'express';
import db from '../config/db.js';
const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECTS = [
  'Question générale',
  'Signaler un bug',
  'Demande de presse',
  'Proposition',
  'Autre',
];

// POST /contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }
  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return res.status(400).json({ error: 'Champ trop long' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }
  if (!SUBJECTS.includes(subject)) {
    return res.status(400).json({ error: 'Sujet invalide' });
  }
  if (message.trim().length < 10) {
    return res
      .status(400)
      .json({ error: 'Message trop court (10 caractères minimum)' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), subject, message.trim()],
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
