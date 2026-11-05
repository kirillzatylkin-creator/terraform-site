# Terraform – Site web + API (projet DWWM)

Site vitrine du jeu **Terraform** (studio fictif Ironveil Studios) avec :

- un **front-end** en HTML / CSS / JavaScript, organisé en modules ES (dossier `FRONTEND`) ;
- un **back-end** Node.js / Express 5 (dossier `BACKEND`) ;
- une base de données **MySQL** (`Terraform_db`) ;
- une **boutique alimentée par la base de données**, un **panier**, un **formulaire de contact** enregistré en base, et un système d'**inscription / connexion** (mots de passe hachés avec bcrypt, authentification par jeton JWT, rôle `admin` pour les routes d'écriture).

---

## 1. Prérequis

| Outil | Rôle |
|---|---|
| Node.js (version 20 ou plus récente) | exécuter le back-end |
| MySQL Server 8 + MySQL Workbench | base de données |
| Visual Studio Code + extension **Live Server** | ouvrir le site (port `5502`, réglé dans `.vscode/settings.json`) |
| Postman | tester l'API |

Vérification dans PowerShell :

```powershell
node -v
npm -v
Get-Service *mysql*
```

---

## 2. Structure du projet

```
Projet site 3/
├── README1.md
├── .vscode/settings.json     (Live Server sur le port 5502)
├── palette.scss              (palette de couleurs de référence)
├── images originaux png/     (images d'origine, avant conversion en WebP)
├── FRONTEND/
│   ├── index.html, about.html, gameplay.html, boutique.html,
│   ├── configuration-requise.html, media.html, contact.html,
│   ├── mentions-legales.html, login.html, register.html, cart.html
│   ├── css/
│   │   ├── base.css          (commun à toutes les pages : variables, thème, nav, footer, responsive)
│   │   ├── components/       (forms.css, filters.css, compare-table.css : chargés seulement là où ils servent)
│   │   └── pages/            (un fichier par page : index.css, boutique.css…)
│   ├── js/                   (modules ES : import / export)
│   │   ├── modules/          (briques réutilisables)
│   │   │   ├── api.js        (adresse de l'API, session, authFetch)
│   │   │   ├── auth-nav.js   (Connexion / Inscription ↔ Déconnexion)
│   │   │   ├── cart-store.js (panier en localStorage + lien « Panier »)
│   │   │   ├── filters.js    (filtres de la galerie et de la boutique)
│   │   │   ├── menu.js       (menu burger + lien d'évitement)
│   │   │   ├── theme.js      (bouton thème clair / sombre)
│   │   │   ├── format.js     (prix en euros)
│   │   │   └── form-status.js
│   │   └── pages/            (un point d'entrée par page ; common.js = code commun à toutes les pages)
│   └── images/               (images en WebP)
└── BACKEND/
    ├── app.js                (application Express exportée : utilisée par le serveur et par les tests)
    ├── server.js             (démarrage : charge .env, vérifie JWT_SECRET, écoute sur le port)
    ├── vitest.config.js      (configuration des tests)
    ├── .env                  (non versionné, voir section 4)
    ├── .env.example          (modèle sans valeurs réelles, versionné)
    ├── .gitignore
    ├── package.json          ("type": "module" : modules ES, import / export)
    ├── config/db.js          (pool de connexions MySQL)
    ├── middleware/
    │   ├── auth.js           (vérification du jeton JWT : 401)
    │   └── admin.js          (vérification du rôle admin : 403)
    ├── tests/auth.test.js    (tests Vitest + Supertest : authentification et rôles)
    ├── docs/openapi.yaml     (documentation de l'API au format OpenAPI 3)
    ├── routes/
    │   ├── games.js
    │   ├── characters.js
    │   ├── products.js
    │   ├── contact.js
    │   └── auth.js
    └── database/
        ├── schema.sql        (création de la base et des 5 tables)
        └── seed.sql          (3 produits de démonstration pour la boutique)
```

### Fonctionnement du menu (front-end)

Tous les liens du menu (« Inscription », « Connexion », « Panier ») et le bouton « Thème sombre » sont écrits **dans le HTML** de chaque page. Le bouton de thème est placé avant la liste des liens : sur mobile il reste à côté du bouton burger, et l'ordre au clavier suit l'ordre à l'écran.

Le JavaScript (`js/pages/common.js`) ne crée pas ces éléments, il les **adapte** :

- utilisateur connecté → « Inscription » est masqué, « Connexion » devient « Déconnexion (nom) » ;
- panier vide → « Panier » ; panier avec des articles → « Panier (n) » ;
- bouton de thème → applique et mémorise le thème clair / sombre (`localStorage`, sinon préférence du système).

---

## 3. Base de données

Les scripts sont dans `BACKEND/database/`. Dans **MySQL Workbench**, se connecter (`127.0.0.1`, port `3306`, utilisateur `root`), puis :

1. **File → Open SQL Script** → `schema.sql` → cliquer sur l'**éclair** (exécute tout le script) ;
2. même chose avec `seed.sql`.

> `schema.sql` utilise `CREATE … IF NOT EXISTS` et `seed.sql` ne réinsère pas un produit qui existe déjà : les deux scripts peuvent être relancés sans créer de doublons.
> Dans un commentaire SQL, il faut **un espace après `--`**.

Tables créées :

| Table | Contenu | Contraintes principales |
|---|---|---|
| `users` | comptes (`name`, `email`, `password_hash`, `role`) | `email` unique, `role` = `user` par défaut |
| `products` | produits de la boutique | `price >= 0`, `category` ∈ `game`, `dlc`, `merch` |
| `games` | jeux (CRUD de l'API) | `price >= 0` |
| `characters` | personnages d'un jeu | clé étrangère `game_id` → `games(id)`, `ON DELETE CASCADE` |
| `messages` | messages du formulaire de contact | tous les champs obligatoires |

### Utilisateur MySQL de l'application

L'application ne se connecte pas avec `root` : elle utilise un compte qui n'a que les droits nécessaires (même principe qu'en production, section 10.2).

```sql
CREATE USER 'terraform_app'@'localhost' IDENTIFIED BY '<mot_de_passe_local>';
GRANT SELECT, INSERT, UPDATE, DELETE ON Terraform_db.* TO 'terraform_app'@'localhost';
```

### Données de test pour l'API (facultatif)

`seed.sql` ne remplit que la boutique. Pour tester `/games` et `/characters` dans le navigateur (étape 3), ajouter un jeu et ses personnages :

```sql
USE Terraform_db;

INSERT INTO games (title, description, price)
VALUES ('Terraform', 'Jeu de survie et d''exploration dans un monde fantastique.', 59.99);

SET @game_id = LAST_INSERT_ID();   -- id du jeu qui vient d'être créé

INSERT INTO characters (game_id, name, role, description) VALUES
(@game_id, 'Chevalier du Voile', 'Défenseur · Combat rapproché',
 'Maître des armures et des armes lourdes.'),
(@game_id, 'Sorcière des Racines', 'Soigneuse · Magie naturelle',
 'Maîtrise les forces de la nature et soigne le groupe.'),
(@game_id, 'Nomade des Terres Désolées', 'Éclaireur · Combat à distance',
 'Rapide et insaisissable, maître des pièges.');
```

> À exécuter une seule fois : contrairement à `seed.sql`, ces `INSERT` créent des doublons s'ils sont relancés.

Vérification :

```sql
USE Terraform_db;
SHOW TABLES;                      -- characters, games, messages, products, users
SELECT COUNT(*) FROM products;    -- 3
SELECT COUNT(*) FROM games;       -- 1 (si les données de test ont été ajoutées)
SELECT COUNT(*) FROM characters;  -- 3 (idem)
```

---

## 4. Configuration du back-end (`BACKEND/.env`)

Copier `.env.example` en `.env` (à côté de `server.js`) et remplacer les valeurs :

```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=terraform_app
DB_PASSWORD=<mot_de_passe_local>
DB_NAME=Terraform_db
JWT_SECRET=<secret_genere_avec_la_commande_ci-dessous>
JWT_EXPIRES_IN=2h
CORS_ORIGIN=http://127.0.0.1:5502,http://localhost:5502
```

Les valeurs entre `< >` sont des **emplacements à remplacer** : aucun mot de passe ni secret réel ne doit apparaître dans ce README ni dans le dépôt Git. Le fichier `.env` est exclu par `.gitignore` ; seul `.env.example` (sans valeurs réelles) est versionné.

`CORS_ORIGIN` liste les origines autorisées à appeler l'API (séparées par des virgules). Elle doit correspondre à l'adresse de **Live Server** (port `5502` dans ce projet) ; si le port change, l'ajouter ici. En production : l'adresse HTTPS du site, par exemple `https://exemple.fr`.

Générer un secret JWT :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Sans `JWT_SECRET`, le serveur **refuse de démarrer** (message `JWT_SECRET is not defined in environment variables`).

Après toute modification du `.env`, **arrêter puis relancer** le serveur : nodemon ne surveille pas ce fichier.

---

## 5. Installation et lancement

### Back-end (terminal n°1)

```powershell
cd "C:\Users\Kirill\Desktop\Projet site 3\BACKEND"
npm install
npm run dev
```

Résultat attendu : `Server is running on port 3000: http://localhost:3000`. Le serveur reste actif tant que la fenêtre est ouverte (`Ctrl + C` pour l'arrêter).

| Script | Commande | Rôle |
|---|---|---|
| `npm run dev` | `nodemon server.js` | développement (redémarre à chaque modification d'un fichier `.js`) |
| `npm start` | `node server.js` | lancement simple (production) |
| `npm test` | `vitest run` | tests automatisés |

Paquets utilisés : `express`, `mysql2`, `dotenv`, `cors`, `helmet`, `express-rate-limit`, `bcryptjs`, `jsonwebtoken` ; en développement : `nodemon`, `vitest`, `supertest`.

### Front-end

1. Ouvrir le dossier du projet dans VS Code.
2. Clic droit sur `FRONTEND/index.html` puis **Open with Live Server**.
3. Le site s'ouvre sur `http://127.0.0.1:5502/FRONTEND/index.html`.

Les modules ES ne fonctionnent pas en ouvrant le fichier directement (`file://`) : il faut passer par Live Server.

Dans `FRONTEND/js/modules/api.js`, l'adresse de l'API doit être **en `http`** (et non `https`) :

```js
export const API_URL = 'http://localhost:3000';
```

---

## 6. API

Adresse de base : `http://localhost:3000`

La documentation complète de l'API (routes, corps des requêtes, réponses, codes d'erreur et messages, authentification Bearer) est dans **`BACKEND/docs/openapi.yaml`**, au format standard **OpenAPI 3**. Pour la consulter :

- **Swagger Editor** : ouvrir <https://editor.swagger.io>, puis **File → Import file** → `openapi.yaml` : la documentation s'affiche à droite, route par route ;
- **Postman** : **Import** → choisir `openapi.yaml` → Postman crée automatiquement une collection avec toutes les requêtes (adresse de base `http://localhost:3000`).

> Ce fichier est écrit à la main : à chaque modification d'une route (nouveau champ, nouveau message d'erreur), il faut le mettre à jour aussi.

Résumé des routes :

| Méthode | Route | Accès | Description | Réponses |
|---|---|---|---|---|
| GET | `/health` | public | état du serveur et de la base | 200 / 500 |
| GET | `/games` | public | liste des jeux | 200 |
| GET | `/games/:id` | public | un jeu | 200 / 404 |
| POST | `/games` | **admin** (jeton) | créer (`title`, `price`, `description`) | 201 / 400 / 401 / 403 |
| PUT | `/games/:id` | **admin** (jeton) | modifier | 200 / 400 / 401 / 403 / 404 |
| DELETE | `/games/:id` | **admin** (jeton) | supprimer (supprime aussi ses personnages) | 200 / 401 / 403 / 404 |
| GET | `/characters` | public | liste (filtre : `?game_id=1`) | 200 |
| GET | `/characters/:id` | public | un personnage avec `game_title` | 200 / 404 |
| POST | `/characters` | **admin** (jeton) | créer (`game_id`, `name`, `role`, `description`) | 201 / 400 / 401 / 403 |
| PUT | `/characters/:id` | **admin** (jeton) | modifier | 200 / 400 / 401 / 403 / 404 |
| DELETE | `/characters/:id` | **admin** (jeton) | supprimer | 200 / 401 / 403 / 404 |
| GET | `/products` | public | produits de la boutique | 200 |
| GET | `/products/:id` | public | un produit | 200 / 404 |
| POST | `/contact` | public | envoyer un message (`name`, `email`, `subject`, `message`) | 201 / 400 |
| POST | `/auth/register` | public | inscription (`username`, `email`, `password`) | 201 / 400 / 409 / 429 |
| POST | `/auth/login` | public | connexion (`email`, `password`), renvoie `token` et `user` | 200 / 400 / 401 / 429 |
| GET | `/auth/me` | **jeton** | profil | 200 / 401 / 404 |

Les routes marquées **jeton** exigent l'en-tête `Authorization: Bearer <token>` (jeton obtenu avec `POST /auth/login`) ; sans jeton, l'API répond `401 authorization required`, avec un jeton modifié ou expiré `401 invalid or expired token`. Les routes marquées **admin** exigent en plus le rôle `admin` : un utilisateur standard reçoit `403 Forbidden`. `/auth/login` et `/auth/register` sont limitées à 10 requêtes par 15 minutes et par adresse IP (`429` au-delà). En cas d'erreur serveur, l'API renvoie uniquement le message générique `Erreur serveur` : le détail technique est journalisé côté serveur et n'est jamais envoyé au client.

Règles de validation côté serveur :

| Route | Règles (sinon `400`) |
|---|---|
| `POST /auth/register` | 3 champs obligatoires ; nom ≥ 3 caractères ; e-mail valide ; mot de passe ≥ 8 caractères |
| `POST /auth/login` | e-mail et mot de passe obligatoires |
| `POST` / `PUT /games` | `title` texte non vide ; `price` nombre ≥ 0 |
| `POST /characters` | `game_id` et `name` obligatoires ; le jeu doit exister |
| `POST /contact` | 4 champs obligatoires ; nom ≤ 100, e-mail ≤ 254, message ≤ 5000 caractères ; e-mail valide ; sujet dans la liste du formulaire ; message ≥ 10 caractères |

---

## 7. Vérification pas à pas

### Étape 0 – Démarrage

| Action | Résultat attendu |
|---|---|
| `Get-Service *mysql*` | statut `Running` |
| `npm run dev` dans `BACKEND` | `Server is running on port 3000` |
| Live Server sur `FRONTEND/index.html` | la page d'accueil s'affiche |

### Étape 1 – Serveur et base

Ouvrir `http://localhost:3000/health` : `{"status":"ok","database":"connected"}`.

### Étape 2 – Tables (Workbench)

```sql
USE Terraform_db;
SHOW TABLES;                        -- characters, games, messages, products, users
SELECT COUNT(*) FROM products;      -- 3
SELECT id, name, email, role FROM users;
DESCRIBE users;
```

### Étape 3 – API en lecture (navigateur)

| Adresse | Résultat attendu |
|---|---|
| `/products` | 3 produits, prix numériques |
| `/products/999` | erreur 404 (produit introuvable) |
| `/games` | un jeu « Terraform » (si les données de test de la section 3 ont été ajoutées) |
| `/characters` | 3 personnages (idem) |
| `/characters?game_id=1` | les personnages du jeu 1 |
| `/games/999` | erreur 404 (jeu introuvable) |

### Étape 4 – Authentification (Postman)

| Requête | Corps | Attendu |
|---|---|---|
| `POST /auth/register` | `{"username":"test5","email":"test5@test.com","password":"MotDePasse1"}` | 201 |
| même requête | | 409 (déjà utilisé) |
| `POST /auth/register` | mot de passe `123` | 400 |
| `POST /auth/login` | e-mail et mot de passe corrects | 200 + `token` |
| `POST /auth/login` | mauvais mot de passe | 401 |
| `GET /auth/me` | sans jeton | 401 |
| `GET /auth/me` | **Authorization → Bearer Token** + jeton | 200 |

> Les identifiants de ce tableau sont **fictifs** (compte de test jetable).

Vérifier que le mot de passe est bien haché :

```sql
SELECT id, name, email, LEFT(password_hash, 7) AS debut FROM users;   -- $2a$10$ (bcrypt)
```

### Étape 5 – Routes protégées (Postman)

Les routes d'écriture exigent un compte **admin**. Promouvoir le compte de test, puis **se reconnecter** pour obtenir un nouveau jeton (le rôle est enregistré dans le jeton au moment de la connexion) :

```sql
UPDATE users SET role = 'admin' WHERE email = 'test5@test.com';
```

Dans Postman, onglet **Authorization → Bearer Token**.

| Requête | Corps / jeton | Attendu |
|---|---|---|
| `POST /games` | `{"title":"Test","price":10}` **sans jeton** | 401 |
| `POST /games` | même corps, jeton d'un utilisateur **non admin** | 403 |
| `POST /games` | même corps, jeton **admin** | 201 + `id` |
| `POST /games` | (vide), jeton admin | 400 |
| `POST /games` | `{"title":"Test","price":-5}`, jeton admin | 400 |
| `PUT /games/X` | `{"title":"Test 2","price":12}` | 200 |
| `POST /characters` | `{"game_id":X,"name":"Test"}` | 201 |
| `POST /characters` | `{"game_id":999,"name":"Test"}` | 400 |
| `DELETE /characters/Y` | | 200 puis 404 si répété |
| `DELETE /games/X` | | 200 puis 404 si répété |

### Étape 6 – Site : boutique et panier

| Action | Attendu |
|---|---|
| Ouvrir `boutique.html` (`Ctrl + F5`) | 3 cartes de produits venant de la base |
| Onglet « Versions du jeu » | 3 cartes |
| Onglet « Merch » | « Aucun résultat dans cette catégorie pour le moment. » |
| Console (`F12`) | aucune erreur rouge |
| Changer un prix dans MySQL puis recharger | le prix change sur la page |
| Arrêter le back-end puis recharger | les cartes par défaut restent affichées + message « Impossible de charger les produits… » |
| Menu avec un panier vide | « Panier » |
| « Ajouter au panier » sur deux produits | le menu affiche « Panier (2) » |
| `cart.html` : boutons `+` / `−` / « Retirer » | quantités, sous-totaux et total mis à jour (10 maximum par produit) |
| « Vider le panier » | « Votre panier est vide », menu « Panier » |
| « Commander » sans être connecté | « Connectez-vous pour passer commande. » |

### Étape 7 – Site : inscription, connexion, déconnexion

| Action | Attendu |
|---|---|
| Menu sur n'importe quelle page | « Inscription » et « Connexion » |
| `register.html` avec de nouvelles données | « Compte créé ! », redirection vers `login.html` |
| Mêmes données une seconde fois | message « déjà utilisé » |
| Deux mots de passe différents | « Les mots de passe ne correspondent pas. » |
| `login.html` avec identifiants corrects | retour à l'accueil ; « Inscription » disparaît, « Connexion » devient « Déconnexion (nom) » |
| Mauvais mot de passe | « Email ou mot de passe incorrect. » |
| `F12` → Application → Local Storage | clés `token` et `user` présentes |
| Clic sur « Déconnexion » | retour à l'accueil, menu « Inscription » / « Connexion », clés supprimées |

### Étape 8 – Site : contact

| Action | Attendu |
|---|---|
| Message de moins de 10 caractères | « Veuillez vérifier les champs du formulaire. » |
| Formulaire complet et valide | « Merci ! Votre message a bien été envoyé. », formulaire vidé |
| Workbench : `SELECT * FROM messages ORDER BY id DESC LIMIT 1;` | le message apparaît |

### Étape 9 – Menu, thème et accessibilité

| Action | Attendu |
|---|---|
| Bouton « Thème sombre » | le site passe en sombre ; le choix est conservé en changeant de page |
| Fenêtre réduite sous 768 px | menu burger ; le bouton de thème reste à côté du burger |
| Clic sur le burger | le menu s'ouvre (`aria-expanded="true"`) |
| Touche `Échap` | le menu se ferme, le focus revient sur le burger |
| Premier appui sur `Tab` | le lien « Aller au contenu principal » apparaît |
| Navigation au `Tab` | ordre : logo → (burger) → thème → liens ; focus toujours visible |

### Étape 10 – Tests automatisés

Les tests utilisent **Vitest** et **Supertest**. La base de données est simulée : MySQL n'a pas besoin d'être démarré.

```powershell
cd BACKEND
npm test
```

Résultat attendu : `12 passed`. Les tests vérifient l'inscription (validation, mot de passe haché, doublon), la connexion (identifiants faux, jeton contenant `id` et `role`), la route `/auth/me` et la protection des routes d'écriture (401 sans jeton, 403 pour un utilisateur non administrateur).

---

## 8. Dépannage

| Message | Cause | Solution |
|---|---|---|
| `ENOENT ... package.json` | commande `npm` lancée dans le mauvais dossier | `cd` vers `BACKEND` |
| `Cannot find module 'express'` | dépendances non installées | `npm install` dans `BACKEND` |
| `JWT_SECRET is not defined in environment variables` | `.env` absent ou sans `JWT_SECRET` | créer le `.env` (section 4) |
| `ECONNREFUSED` | MySQL arrêté ou mauvaise adresse | `Start-Service MySQL80`, utiliser `DB_HOST=127.0.0.1` |
| `ER_ACCESS_DENIED_ERROR` | mauvais identifiants dans `.env` ou utilisateur `terraform_app` non créé | vérifier `DB_USER` et `DB_PASSWORD`, créer l'utilisateur (section 3), relancer le serveur |
| `401 authorization required` | jeton absent | se connecter, utiliser **Bearer Token** |
| `401 invalid or expired token` | jeton modifié ou expiré (2 h) | se reconnecter |
| `403 Forbidden` | compte non administrateur, ou jeton obtenu avant la promotion | promouvoir le compte (`UPDATE users SET role = 'admin' WHERE email = '...'`), puis se reconnecter pour obtenir un nouveau jeton |
| `429 Trop de tentatives` | limite de 10 requêtes / 15 min sur `/auth/login` et `/auth/register` | attendre, ou redémarrer le serveur en développement |
| Erreur CORS dans la console (`F12`) | l'adresse du site n'est pas dans `CORS_ORIGIN` | ajouter l'adresse de Live Server (ex. `http://127.0.0.1:5502`) dans `.env` et relancer le serveur |
| `Access denied for user ''@'localhost'` | `DB_USER` absent du `.env` | corriger le nom de la variable |
| `ER_BAD_DB_ERROR` / `Unknown database` | base non créée | exécuter `schema.sql` |
| `Table ... doesn't exist` (1146) | table non créée | exécuter `schema.sql` |
| `Error 1064` au lancement du script | commentaire sans espace après `--` | écrire `-- commentaire` |
| `Error 1175` (safe update) | `DELETE` sans condition sur la clé | ajouter `WHERE id > 0` |
| `Error 3819` (check constraint) | prix négatif inséré directement en SQL | utiliser un prix ≥ 0 |
| `Cannot GET /products` | route non branchée dans `app.js` | ajouter `app.use('/products', productsRouter)` |
| `argument handler must be a function` | fichier de route vide ou sans `export default router;` | compléter le fichier |
| `Cannot destructure property ... of 'req.body'` | requête sans corps JSON (Express 5) | Body → raw → JSON, et garder la ligne qui initialise `req.body` dans `app.js` |
| `400 JSON invalide` | corps JSON mal écrit dans Postman | vérifier les guillemets et les virgules |
| `ERR_SSL_PROTOCOL_ERROR` | `API_URL` en `https` | utiliser `http://localhost:3000` |
| `Failed to fetch` / « Serveur indisponible » | serveur arrêté | relancer `npm run dev` |
| `ERR_MODULE_NOT_FOUND` / `Cannot find module '.../config/db'` | import relatif sans extension (modules ES) | écrire l'extension : `'../config/db.js'` |
| `require is not defined in ES module scope` | `require(...)` dans un projet `"type": "module"` | utiliser `import ... from ...` |
| `does not provide an export named 'sign'` | import nommé depuis un paquet CommonJS (`jsonwebtoken`) | `import jwt from 'jsonwebtoken'` puis `jwt.sign(...)` |
| Page blanche / scripts non chargés, erreur CORS sur `file://` | page ouverte en double-cliquant sur le fichier | ouvrir avec Live Server |
| Menu sans « Déconnexion » après connexion | anciennes données dans le Local Storage | supprimer `token` et `user`, se reconnecter |

---

## 9. Sécurité : état actuel et limites

| Mesure en place | Détail |
|---|---|
| Mots de passe hachés | `bcryptjs` (coût 10) ; le mot de passe en clair n'est jamais stocké |
| Authentification | jeton JWT signé avec `JWT_SECRET`, expiration `JWT_EXPIRES_IN` (2 h) ; le serveur refuse de démarrer sans `JWT_SECRET` |
| Routes d'écriture réservées aux administrateurs | `POST` / `PUT` / `DELETE` de `/games` et `/characters` : `authRequired` (401 sans jeton) puis `adminRequired` (403 si le rôle n'est pas `admin`) ; le rôle est dans le jeton JWT |
| Requêtes SQL paramétrées | placeholders `?` : protection contre l'injection SQL |
| Compte MySQL limité | l'application utilise `terraform_app` (SELECT, INSERT, UPDATE, DELETE), jamais `root` |
| Validation des entrées | côté serveur : champs obligatoires, types, longueurs maximales, format d'e-mail, prix ≥ 0, liste de sujets (voir section 6) ; contraintes SQL en plus (`UNIQUE`, `CHECK`, clé étrangère) |
| Message de connexion unique | même `401` pour un e-mail inconnu et un mauvais mot de passe (pas d'énumération des comptes) |
| Erreurs sans fuite d'informations | message générique `Erreur serveur` côté client, détail uniquement dans les logs serveur |
| Secrets hors du code | `.env` exclu de Git (`.gitignore`), modèle `.env.example` sans valeurs réelles |
| Rôle par défaut | l'inscription crée toujours le rôle `user` ; un administrateur est promu manuellement en base |
| CORS restreint | seules les origines de `CORS_ORIGIN` sont autorisées |
| Limitation des tentatives | `express-rate-limit` sur `/auth/login` et `/auth/register` : 10 requêtes / 15 min / IP (429 ensuite) |
| En-têtes de sécurité | `helmet` |
| Affichage sûr côté front | données de l'API insérées avec `textContent` (jamais `innerHTML`) : protection contre l'XSS |
| Tests automatisés | Vitest + Supertest : authentification, jeton, rôles (12 tests) |

**Limites connues** (pistes d'amélioration) :

- le jeton est conservé côté navigateur (`localStorage`) : une faille XSS permettrait de le lire ; pas de jeton de rafraîchissement ni de révocation ; un administrateur rétrogradé garde ses droits jusqu'à l'expiration du jeton ;
- le front-end ne vérifie pas l'expiration du jeton : après 2 h, le menu peut encore afficher « Déconnexion (nom) » ;
- le prix du panier est stocké dans le navigateur : la future validation de commande devra recalculer le total côté serveur ;
- pas encore de commande (le bouton « Commander » ne fait que vérifier la connexion) ;
- le compteur de `express-rate-limit` est en mémoire : il est réinitialisé au redémarrage et non partagé entre plusieurs instances ;
- un administrateur est promu manuellement en base ; il n'y a pas d'interface d'administration ;
- les tests ne couvrent que l'authentification et simulent la base de données : il n'y a pas encore de test d'intégration avec un vrai MySQL ;
- pas de pagination sur les listes, et la validation des entrées est écrite à la main (une bibliothèque comme Zod pourrait la remplacer) ;
- la documentation OpenAPI est un fichier écrit à la main : elle doit être tenue à jour avec le code, et l'API ne la sert pas encore elle-même (pas de page `/docs` avec Swagger UI) ;
- le bouton de thème est visible sans JavaScript mais ne fonctionne qu'avec.

---

## 10. Déploiement en production (VPS, HTTPS, PM2)

> Le projet est développé et testé en local. Cette section décrit la démarche prévue pour une mise en production.

**En résumé :** un VPS Linux ; l'API Node.js lancée et supervisée par **PM2** ; **Nginx** en reverse proxy devant l'API ; **HTTPS** avec un certificat Let's Encrypt ; MySQL accessible uniquement en local avec un utilisateur dédié ; secrets dans des variables d'environnement ; code de l'API adapté pour la production (CORS restreint, en-têtes de sécurité, limitation des tentatives de connexion).

### 10.1 Préparer le serveur

- Louer un VPS (Ubuntu LTS), créer un utilisateur non-root, se connecter en **SSH par clé** et désactiver la connexion SSH par mot de passe.
- Pare-feu : n'ouvrir que les ports 22 (SSH), 80 (HTTP) et 443 (HTTPS). Les ports `3000` (API) et `3306` (MySQL) ne sont **pas** exposés.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

- Installer Node.js (version LTS), Nginx et MySQL ; garder le système à jour (mises à jour de sécurité automatiques).

### 10.2 Base de données

- MySQL écoute uniquement sur `127.0.0.1`.
- Utilisateur applicatif dédié, avec des droits limités à la base du projet (jamais `root`) :

```sql
CREATE USER 'terraform_app'@'localhost' IDENTIFIED BY '<mot_de_passe_fort>';
GRANT SELECT, INSERT, UPDATE, DELETE ON Terraform_db.* TO 'terraform_app'@'localhost';
```

- Créer les tables avec `database/schema.sql` (et `seed.sql` pour les produits), et prévoir des sauvegardes régulières (`mysqldump` planifié avec `cron`).

### 10.3 Déployer le code et lancer l'API avec PM2

```bash
git clone <url_du_depot> && cd <dossier>/BACKEND
npm ci --omit=dev          # uniquement les dépendances de production (pas nodemon ni les outils de test)
nano .env                  # créer le .env sur le serveur
chmod 600 .env             # lisible uniquement par son propriétaire
```

Dans le `.env` de production : `NODE_ENV=production`, un `JWT_SECRET` **nouveau** (généré, différent de celui du développement), l'utilisateur MySQL dédié, `CORS_ORIGIN=https://exemple.fr`.

**PM2** est un gestionnaire de processus : il relance l'API si elle plante, la redémarre au démarrage du serveur et centralise les logs.

```bash
sudo npm install -g pm2
pm2 start server.js --name terraform-api
pm2 save                   # mémorise la liste des processus
pm2 startup                # affiche une commande à exécuter avec sudo : démarrage automatique au boot
pm2 logs terraform-api     # consulter les logs
```

Remarque : le projet étant en modules ES (`"type": "module"`), un éventuel fichier de configuration PM2 doit s'appeler `ecosystem.config.cjs`.

Mise à jour : `git pull`, puis `npm ci --omit=dev`, puis `pm2 restart terraform-api`.

### 10.4 Nginx (reverse proxy) et HTTPS

Nginx reçoit les requêtes publiques et les transmet à l'API qui n'écoute qu'en local :

```nginx
server {
    server_name api.exemple.fr;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**HTTPS** : acheter un nom de domaine, pointer son enregistrement DNS (type A) vers l'IP du VPS, puis obtenir un certificat gratuit **Let's Encrypt** avec Certbot :

```bash
sudo certbot --nginx -d api.exemple.fr
```

Certbot configure Nginx, ajoute la redirection HTTP vers HTTPS et renouvelle le certificat automatiquement. Le chiffrement protège les mots de passe et les jetons JWT pendant leur transport sur le réseau.

Le front-end (dossier `FRONTEND`, fichiers statiques) peut être servi par le même Nginx ou par un hébergement statique.

### 10.5 Adaptations du code pour la production

- Front-end : remplacer `API_URL = 'http://localhost:3000'` (dans `js/modules/api.js`) par l'adresse HTTPS de l'API (`https://api.exemple.fr`).
- Déjà en place dans le code : `helmet`, CORS restreint par `CORS_ORIGIN` et `express-rate-limit` sur `/auth/login` et `/auth/register`.
- En production : définir `NODE_ENV=production` (active `trust proxy`, nécessaire derrière Nginx pour que la limitation voie l'adresse IP réelle du visiteur) et `CORS_ORIGIN=https://exemple.fr`.
- Ne jamais afficher de détails d'erreur au client (déjà le cas) et ne jamais versionner le `.env`.

### 10.6 Surveillance

- Logs : `pm2 logs` ; état en direct : `pm2 monit`.
- La route `GET /health` peut être surveillée par un service externe (alerte si l'API ou la base ne répond plus).
- Compléments possibles : `fail2ban` contre les attaques sur SSH, sauvegardes testées régulièrement.
