import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import gamesRouter from './routes/games.js';
import charactersRouter from './routes/characters.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const app = express();

// Derrière Nginx : lire l'IP réelle du visiteur (nécessaire au rate limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

import contactRouter from './routes/contact.js';

app.use(express.json());

// CORS configuration(limitation aux origines autorisées)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());
  console.log('CORS autorisé pour :', allowedOrigins);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));

// Rate limiting for authentication routes

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'test' ? 1000 : 10, 
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez plus tard' },
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Express 5 : req.body est undefined si la requête n'a pas de corps

app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.use('/contact', contactRouter);
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
    res.status(500).json({ status: 'error', database: 'unreachable' });
  }
});

export default app;