import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import gamesRouter from './routes/games.js';
import charactersRouter from './routes/characters.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
const app = express();
const port = process.env.PORT || 3000;
import contactRouter from './routes/contact.js';

app.use(cors());
app.use(express.json());
app.use('/contact', contactRouter);

// Express 5 : req.body est undefined si la requête n'a pas de corps

app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.use('/products', productsRouter);
app.use('/games', gamesRouter);
app.use('/characters', charactersRouter);
app.use('/auth', authRouter);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON invalide' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Health check 
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Database error:', err.code, err.message);
    res
      .status(500)
      .json({ status: 'error', database: 'unreachable' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`),
);
