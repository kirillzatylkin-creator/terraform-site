import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../config/db.js', () => ({ default: { query: vi.fn() } }));

import db from '../config/db.js';
import app from '../app.js';

const tokenFor = payload => jwt.sign(payload, process.env.JWT_SECRET);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST /auth/register', () => {
  it('400 if fields are missing', async () => {
    const res = await request(app).post('/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('400 if the password is too short', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'cyrill', email: 'c@test.fr', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('201 and password hashed in database', async () => {
    db.query.mockResolvedValue([{ insertId: 1 }]);
    const res = await request(app).post('/auth/register').send({
      username: 'cyrill',
      email: 'c@test.fr',
      password: 'password451',
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, username: 'cyrill', email: 'c@test.fr' });

    const storedHash = db.query.mock.calls[0][1][2];
    expect(storedHash).not.toBe('password451');
    expect(await bcrypt.compare('password451', storedHash)).toBe(true);
  });

  it('409 if the email already exists', async () => {
    db.query.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
    const res = await request(app).post('/auth/register').send({
      username: 'cyrill',
      email: 'c@test.fr',
      password: 'password451',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /auth/login', () => {
  it('400 if fields are missing', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('401 if the user does not exist', async () => {
    db.query.mockResolvedValue([[]]);
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'unknown@test.fr', password: 'password451' });
    expect(res.status).toBe(401);
  });

  it('401 if the password is wrong', async () => {
    const hash = await bcrypt.hash('goodpassword', 4);
    db.query.mockResolvedValue([
      [
        {
          id: 1,
          name: 'cyrill',
          email: 'c@test.fr',
          password_hash: hash,
          role: 'user',
        },
      ],
    ]);
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'c@test.fr', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('200 with a token containing id and role', async () => {
    const hash = await bcrypt.hash('goodpassword', 4);
    db.query.mockResolvedValue([
      [
        {
          id: 1,
          name: 'cyrill',
          email: 'c@test.fr',
          password_hash: hash,
          role: 'user',
        },
      ],
    ]);
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'c@test.fr', password: 'goodpassword' });

    expect(res.status).toBe(200);
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload).toMatchObject({ id: 1, role: 'user' });
    expect(JSON.stringify(res.body)).not.toContain('password_hash');
  });
});

describe('GET /auth/me', () => {
  it('401 without token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('200 with a valid token', async () => {
    db.query.mockResolvedValue([
      [{ id: 1, name: 'cyrill', email: 'c@test.fr', role: 'user' }],
    ]);
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${tokenFor({ id: 1, role: 'user' })}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('c@test.fr');
  });
});

describe('Admin-only routes', () => {
  it('401 without token', async () => {
    const res = await request(app).post('/games').send({});
    expect(res.status).toBe(401);
  });

  it('403 for a standard user', async () => {
    const res = await request(app)
      .post('/games')
      .set('Authorization', `Bearer ${tokenFor({ id: 2, role: 'user' })}`)
      .send({});
    expect(res.status).toBe(403);
  });
});
