-- Base utilisee par BACKEND/config/db.js
CREATE DATABASE IF NOT EXISTS Terraform_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Terraform_db;

-- Compte cree par POST /auth/register et lu par /auth/login et /auth/me
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM ('user','admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Aligne la longueur sur le champ d'inscription du frontend
ALTER TABLE users MODIFY name VARCHAR(150) NOT NULL;

-- Catalogue lu par GET /products et affiche dans FRONTEND/Boutique.html
-- features contient les elements separes par des retours a la ligne
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  category ENUM('game', 'dlc', 'merch') NOT NULL DEFAULT 'game',
  image VARCHAR(255) NULL,
  features TEXT NULL,
  CONSTRAINT chk_products_price_nonnegative CHECK (price >= 0)
) ;

-- Ces colonnes correspondent aux requetes de BACKEND/routes/games.js
CREATE TABLE IF NOT EXISTS games (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT chk_games_price_nonnegative CHECK (price >= 0)
) ;

-- Chaque personnage appartient a un jeu.
CREATE TABLE IF NOT EXISTS characters (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(100) NULL,
  description TEXT NULL,
  INDEX idx_characters_game_id (game_id),
  CONSTRAINT fk_characters_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON DELETE CASCADE
);

-- Messages du formulaire de contact, ecrits par POST /contact (BACKEND/routes/contact.js)
CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
