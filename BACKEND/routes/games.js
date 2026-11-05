import { Router } from 'express';
const router = Router();
import db from '../config/db.js';
import authRequired from '../middleware/auth.js';
import adminRequired from '../middleware/admin.js';





// GET /games

function validateGame(req, res, next) {
  const { title, price } = req.body;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title invalide' });
  }
  if (
    price === '' ||
    price === null ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({ error: 'price invalide (nombre positif)' });
  }
  next();
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /games/id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /games
router.post('/', authRequired, adminRequired, validateGame, async (req, res) => {
  const { title, description, price } = req.body;
 
  try {
    const [result] = await db.query(
      'INSERT INTO games (title, description, price) VALUES (?, ?, ?)',
      [title, description || null, price],
    );
    res.status(201).json({ id: result.insertId, title, description, price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /games/id
router.put('/:id', authRequired,adminRequired,validateGame, async (req, res) => {
  const { title, description, price } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE games SET title = ?, description = ?, price = ? WHERE id = ?',
      [title, description || null, price, req.params.id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Game not found' });
    res.json({ id: Number(req.params.id), title, description, price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /games/id
router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM games WHERE id = ?', [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Game not found' });
    res.json({ message: 'Game deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
