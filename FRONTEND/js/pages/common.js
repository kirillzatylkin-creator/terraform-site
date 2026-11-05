// Code commun à TOUTES les pages : thème, menu, liens Connexion / Panier.
// Les pages simples (accueil, about…) chargent seulement ce fichier.
// Les autres fichiers de ce dossier commencent par l'importer.
import { initTheme } from '../modules/theme.js';
import { initMenu, initSkipLink } from '../modules/menu.js';
import { renderAuthNav } from '../modules/auth-nav.js';
import { addCartLink } from '../modules/cart-store.js';

initTheme();
initMenu();
initSkipLink();
renderAuthNav();
addCartLink();
