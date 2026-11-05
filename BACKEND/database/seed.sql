-- Donnees de demonstration pour FRONTEND/Boutique.html.
-- Les produits existants portant le meme nom ne sont pas dupliques.
USE Terraform_db;

INSERT INTO products (name, category, description, price, image, features)
SELECT
  'Édition Standard',
  'game',
  'Le jeu de base et des contenus exclusifs.',
  59.99,
  'images/03-fond-chateau.webp',
  CONCAT_WS(CHAR(10), 'Jeu de base', 'Contenus exclusifs', 'Support technique')
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Édition Standard'
);

INSERT INTO products (name, category, description, price, image, features)
SELECT
  'Édition Deluxe',
  'game',
  'Le jeu de base, des contenus additionnels et un artbook numérique.',
  79.99,
  'images/03-fond-chateau.webp',
  CONCAT_WS(
    CHAR(10),
    'Jeu de base',
    'Contenus additionnels + bonus exclusifs',
    'Artbook numérique',
    'Support technique + multijoueur'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Édition Deluxe'
);

INSERT INTO products (name, category, description, price, image, features)
SELECT
  'Édition Gold',
  'game',
  'Le jeu de base, des contenus additionnels et une installation guidée.',
  99.99,
  'images/03-fond-chateau.webp',
  CONCAT_WS(
    CHAR(10),
    'Jeu de base',
    'Contenus additionnels + bonus exclusifs',
    'Artbook numérique',
    'Support technique + multijoueur',
    'Installation guidée par nos experts et techniciens'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Édition Gold'
);
