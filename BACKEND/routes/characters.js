import express from 'express';
import db from '../config/db.js';
import authRequired from '../middleware/auth.js';
import adminrequired  from '../middleware/admin.js';
import adminRequired from '../middleware/admin.js';
const router = express.Router();

// GET /characters
router.get('/', async (req, res) => {
  try {
    const { game_id } = req.query;
    const [rows] = game_id
      ? await db.query('SELECT * FROM characters WHERE game_id = ?', [game_id])
      : await db.query('SELECT * FROM characters');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /characters/id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, g.title AS game_title
       FROM characters c
       JOIN games g ON g.id = c.game_id
       WHERE c.id = ?`,
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Character not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /characters - creer un nouveau personnage
router.post('/', authRequired,adminRequired, async (req, res) => {
  const { game_id, name, role, description } = req.body;
  if (!game_id || !name) {
    return res.status(400).json({ error: 'game_id and name necessary' });
  }
  try {
    const [game] = await db.query('SELECT id FROM games WHERE id = ?', [
      game_id,
    ]);
    if (game.length === 0)
      return res.status(400).json({ error: 'No game with such game_id' });

    const [result] = await db.query(
      'INSERT INTO characters (game_id, name, role, description) VALUES (?, ?, ?, ?)',
      [game_id, name, role || null, description || null],
    );
    res
      .status(201)
      .json({ id: result.insertId, game_id, name, role, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /characters/id
router.put('/:id', authRequired,adminRequired, async (req, res) => {
  const { name, role, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name necessary' });
  try {
    const [result] = await db.query(
      'UPDATE characters SET name = ?, role = ?, description = ? WHERE id = ?',
      [name, role || null, description || null, req.params.id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Character not found' });
    res.json({ id: Number(req.params.id), name, role, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /characters/id
router.delete('/:id', authRequired,adminRequired, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM characters WHERE id = ?', [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Character not found' });
    res.json({ message: 'Character deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
