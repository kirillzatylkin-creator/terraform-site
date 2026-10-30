
// THÈME CLAIR / SOMBRE

const racine = document.documentElement; // la balise <html>
const systemeSombre = window.matchMedia('(prefers-color-scheme: dark)');

const boutonTheme = document.createElement('button');
boutonTheme.type = 'button';
boutonTheme.className = 'theme-toggle';

const iconeTheme = document.createElement('span');
iconeTheme.textContent = '☾';
iconeTheme.setAttribute('aria-hidden', 'true'); // décoratif : le lecteur d'écran l'ignore
boutonTheme.append(iconeTheme, ' Thème sombre');

// Lit le choix enregistré (localStorage peut être bloqué en navigation privée)
function lireThemeEnregistre() {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
}

function appliquerTheme(theme) {
  racine.dataset.theme = theme; // → <html data-theme="dark"> ou "light"
  boutonTheme.setAttribute('aria-pressed', String(theme === 'dark'));
}

//  choix enregistré,  réglage du système,  clair par défaut
appliquerTheme(lireThemeEnregistre() || (systemeSombre.matches ? 'dark' : 'light'));

boutonTheme.addEventListener('click', () => {
  const nouveauTheme = racine.dataset.theme === 'dark' ? 'light' : 'dark';
  appliquerTheme(nouveauTheme);
  try {
    localStorage.setItem('theme', nouveauTheme);
  } catch {
    // pas d'enregistrement possible : le thème change quand même pour cette page
  }
});

document.querySelector('nav')?.append(boutonTheme);

// MENU BURGER
// Le HTML contient le bouton. Le CSS affiche le menu avec la classe "ouvert".

const boutonMenu = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-links');

if (boutonMenu && menu) {
  const mobile = window.matchMedia('(max-width: 768px)');
  boutonMenu.closest('nav').classList.add('nav-enhanced');

  function changerMenu(ouvert) {
    menu.classList.toggle('ouvert', ouvert);
    boutonMenu.setAttribute('aria-expanded', String(ouvert));
    boutonMenu.setAttribute(
      'aria-label',
      ouvert ? 'Fermer le menu' : 'Ouvrir le menu',
    );
  }

  boutonMenu.addEventListener('click', () => {
    changerMenu(!menu.classList.contains('ouvert'));
  });

  menu.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a')) {
      boutonMenu.focus();
      changerMenu(false);
    }
  });

  // Échap ferme le menu et remet le clavier sur le bouton
  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      mobile.matches &&
      menu.classList.contains('ouvert')
    ) {
      boutonMenu.focus();
      changerMenu(false);
    }
  });

  // Réinitialiser le menu quand on passe entre mobile et ordinateur
  mobile.addEventListener('change', () => {
    if (mobile.matches && menu.contains(document.activeElement))
      boutonMenu.focus();
    if (!mobile.matches && document.activeElement === boutonMenu)
      document.querySelector('.nav-logo').focus();
    changerMenu(false);
  });
}

// FILTRES : une même fonction pour la galerie et la boutique
function activerFiltres(selecteurBoutons, selecteurCartes, selecteurMessage) {
  const boutons = document.querySelectorAll(selecteurBoutons);

  const message = document.querySelector(selecteurMessage);
  if (!boutons.length || !message) return;

  function filtrer(boutonActif) {
    // Relu à chaque filtre : les cartes peuvent être ajoutées par le JS
    const cartes = document.querySelectorAll(selecteurCartes);
    const filtre = boutonActif.dataset.filter;
    let nombre = 0;

    cartes.forEach(carte => {
      const categories = (carte.dataset.category ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      carte.hidden = filtre !== 'all' && !categories.includes(filtre);
      if (!carte.hidden) nombre++;
    });

    boutons.forEach(bouton => {
      const actif = bouton === boutonActif;
      bouton.classList.toggle('active', actif);
      bouton.setAttribute('aria-pressed', String(actif));
    });

    message.textContent = 'Résultats affichés : ' + nombre;
    if (nombre === 0)
      message.textContent =
        'Aucun résultat dans cette catégorie pour le moment.';
  }

  boutons.forEach(bouton => {
    bouton.addEventListener('click', () => filtrer(bouton));
  });
  filtrer(boutons[0]);
}

activerFiltres('.filter-btn', '.g-item', '#gallery-status');
activerFiltres('.tab-btn', '.product-card', '#store-status');

const skipLink = document.querySelector('.skip-link');
const mainContent = document.getElementById('main-content');

if (skipLink && mainContent) {
  skipLink.addEventListener('click', event => {
    event.preventDefault();

    mainContent.focus({ preventScroll: true });
    mainContent.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    });
  });
}

const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    const f = contactForm.elements;
    const bouton = contactForm.querySelector('.form-submit');

    bouton.disabled = true;
    contactStatus.textContent = 'Envoi en cours...';

    try {
      const res = await fetch(API_URL + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f['name'].value.trim(),
          email: f['email'].value.trim(),
          subject: f['subject'].value,
          message: f['message'].value.trim(),
        }),
      });

      if (res.ok) {
        contactForm.reset();
        contactStatus.textContent = 'Merci ! Votre message a bien été envoyé.';
      } else if (res.status === 400) {
        contactStatus.textContent =
          'Veuillez vérifier les champs du formulaire.';
      } else {
        contactStatus.textContent = 'Erreur du serveur. Réessayez plus tard.';
      }
    } catch {
      contactStatus.textContent = 'Serveur indisponible. Réessayez plus tard.';
    } finally {
      bouton.disabled = false;
    }
  });

  contactForm.addEventListener('input', () => {
    contactStatus.textContent = '';
  });
}

// API URL authentication
const API_URL = 'http://localhost:3000';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (error) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'Index.html';
}

// requêtes avec le token d'authentification
function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

// Liens du menu : Connexion / Inscription ou Déconnexion
function renderAuthNav() {
  const liste = document.querySelector('.nav-links');
  if (!liste) return;

  const page = location.pathname.split('/').pop().toLowerCase();
  const user = getUser();

  function ajouterLien(texte, href) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = texte;
    a.href = href;
    if (page === href) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
    li.appendChild(a);
    liste.appendChild(li);
    return a;
  }

  if (user) {
    const nom = user.username || user.name || user.email;
    const lien = ajouterLien('Déconnexion (' + nom + ')', '#');
    lien.addEventListener('click', event => {
      event.preventDefault();
      logout();
    });
  } else {
    ajouterLien('Connexion', 'login.html');
    ajouterLien('Inscription', 'register.html');
  }
}

renderAuthNav();

// Messages des formulaires
const authStatus = document.getElementById('auth-status');

function afficherStatut(texte, erreur = false) {
  if (!authStatus) return;
  authStatus.textContent = texte;
  authStatus.classList.toggle('error', erreur);
}

// Inscription
const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    const f = registerForm.elements;

    if (f.password.value !== f.password2.value) {
      afficherStatut('Les mots de passe ne correspondent pas.', true);
      return;
    }

    afficherStatut('Création du compte...');
    try {
      const res = await fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: f.username.value.trim(),
          email: f.email.value.trim(),
          password: f.password.value,
        }),
      });

      if (res.ok) {
        afficherStatut('Compte créé ! Redirection vers la connexion...');
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      } else if (res.status === 409) {
        afficherStatut(
          'Cet email ou ce nom d’utilisateur est déjà utilisé.',
          true,
        );
      } else if (res.status === 400) {
        afficherStatut(
          'Données invalides (mot de passe : 8 caractères minimum).',
          true,
        );
      } else {
        afficherStatut('Erreur du serveur. Réessayez plus tard.', true);
      }
    } catch {
      afficherStatut(
        'Serveur indisponible. Vérifiez que le backend est lancé.',
        true,
      );
    }
  });
}

// Connexion
const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;

    afficherStatut('Connexion en cours...');
    try {
      const res = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        saveSession(data.token, data.user || { email });
        window.location.href = 'Index.html';
      } else if (res.status === 401) {
        afficherStatut('Email ou mot de passe incorrect.', true);
      } else if (res.status === 400) {
        afficherStatut('Veuillez remplir tous les champs.', true);
      } else {
        afficherStatut('Erreur du serveur. Réessayez plus tard.', true);
      }
    } catch {
      afficherStatut(
        'Serveur indisponible. Vérifiez que le backend est lancé.',
        true,
      );
    }
  });
}

//  BOUTIQUE : produits depuis la base de données

const productsGrid = document.getElementById('products-grid');

function formatPrix(valeur) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(valeur));
}

function creerCarteProduit(produit) {
  const carte = document.createElement('div');
  carte.className = 'product-card';
  carte.dataset.category = produit.category;

  const zoneImage = document.createElement('div');
  zoneImage.className = 'product-img';
  const image = document.createElement('img');
  image.src = produit.image || 'images/03-fond-chateau.png';
  image.alt = produit.name;
  image.loading = 'lazy';
  zoneImage.appendChild(image);

  const info = document.createElement('div');
  info.className = 'product-info';

  const nom = document.createElement('div');
  nom.className = 'product-type';
  nom.textContent = produit.name;

  const description = document.createElement('p');
  description.className = 'product-description';
  description.textContent = produit.description || '';

  const prix = document.createElement('p');
  prix.className = 'product-price';
  prix.textContent = formatPrix(produit.price);

  const liste = document.createElement('ul');
  liste.className = 'product-features';
  (produit.features || '')
    .split('\n')
    .filter(Boolean)
    .forEach(texte => {
      const li = document.createElement('li');
      li.textContent = texte.trim();
      liste.appendChild(li);
    });

  const actions = document.createElement('div');
  actions.className = 'product-actions';
  const bouton = document.createElement('button');
  bouton.className = 'add-to-cart-btn';
  bouton.type = 'button';
  bouton.textContent = 'Ajouter au panier';
  bouton.addEventListener('click', () => {
    addToCart(produit);
    bouton.textContent = 'Ajouté ✓';
    setTimeout(() => (bouton.textContent = 'Ajouter au panier'), 1200);
  });

  actions.appendChild(bouton);

  info.append(nom, description, prix, liste, actions);
  carte.append(zoneImage, info);
  return carte;
}

async function chargerProduits() {
  try {
    const res = await fetch(API_URL + '/products');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const produits = await res.json();

    productsGrid.replaceChildren(...produits.map(creerCarteProduit));

    // Réappliquer le filtre actif aux nouvelles cartes
    document.querySelector('.tab-btn.active')?.click();
  } catch (erreur) {
    console.error('Chargement des produits impossible :', erreur);
    const statut = document.getElementById('store-status');
    if (statut)
      statut.textContent =
        'Impossible de charger les produits depuis le serveur. Affichage de la version par défaut.';
  }
}

if (productsGrid) chargerProduits();

//PANIER
// PANIER (localStorage)
const MAX_QUANTITE = 10;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(produit) {
  const cart = getCart();
  const ligne = cart.find(l => l.id === produit.id);
  if (ligne) {
    ligne.quantity = Math.min(ligne.quantity + 1, MAX_QUANTITE);
  } else {
    cart.push({
      id: produit.id,
      name: produit.name,
      price: Number(produit.price),
      image: produit.image,
      quantity: 1,
    });
  }
  saveCart(cart);
}

function setQuantity(id, quantity) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(l => l.id !== id);
  } else {
    const ligne = cart.find(l => l.id === id);
    if (ligne) ligne.quantity = Math.min(quantity, MAX_QUANTITE);
  }
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function cartCount() {
  return getCart().reduce((somme, l) => somme + l.quantity, 0);
}

function cartTotal() {
  return getCart().reduce((somme, l) => somme + l.price * l.quantity, 0);
}

function updateCartCount() {
  const lien = document.getElementById('cart-link');
  if (lien) lien.textContent = 'Panier (' + cartCount() + ')';
}

function addCartLink() {
  const liste = document.querySelector('.nav-links');
  if (!liste) return;

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = 'cart.html';
  a.id = 'cart-link';
  a.textContent = 'Panier';
  li.appendChild(a);
  liste.appendChild(li);

  updateCartCount();
}

addCartLink();

// ----- Page cart.html -----
const cartContent = document.getElementById('cart-content');
const cartStatus = document.getElementById('cart-status');

function creer(tag, texte, classe) {
  const e = document.createElement(tag);
  if (texte !== undefined) e.textContent = texte;
  if (classe) e.className = classe;
  return e;
}

function renderCart() {
  if (!cartContent) return;
  const cart = getCart();
  cartContent.replaceChildren();

  if (cart.length === 0) {
    const vide = creer('p', 'Votre panier est vide. ');
    const lien = creer('a', 'Voir la boutique');
    lien.href = 'Boutique.html';
    vide.appendChild(lien);
    cartContent.appendChild(vide);
    return;
  }

  const table = creer('table', undefined, 'cart-table');
  const entete = creer('thead');
  const trEntete = creer('tr');
  ['Produit', 'Prix', 'Quantité', 'Sous-total', ''].forEach(t =>
    trEntete.appendChild(creer('th', t)),
  );
  entete.appendChild(trEntete);
  table.appendChild(entete);

  const corps = creer('tbody');
  cart.forEach(ligne => {
    const tr = creer('tr');
    tr.appendChild(creer('td', ligne.name));
    tr.appendChild(creer('td', formatPrix(ligne.price)));

    const tdQte = creer('td');
    const moins = creer('button', '−', 'qty-btn');
    moins.type = 'button';
    moins.addEventListener('click', () => {
      setQuantity(ligne.id, ligne.quantity - 1);
      renderCart();
    });
    const plus = creer('button', '+', 'qty-btn');
    plus.type = 'button';
    plus.addEventListener('click', () => {
      setQuantity(ligne.id, ligne.quantity + 1);
      renderCart();
    });
    tdQte.append(
      moins,
      creer('span', String(ligne.quantity), 'qty-value'),
      plus,
    );
    tr.appendChild(tdQte);

    tr.appendChild(creer('td', formatPrix(ligne.price * ligne.quantity)));

    const tdSuppr = creer('td');
    const suppr = creer('button', 'Retirer', 'qty-btn');
    suppr.type = 'button';
    suppr.addEventListener('click', () => {
      setQuantity(ligne.id, 0);
      renderCart();
    });
    tdSuppr.appendChild(suppr);
    tr.appendChild(tdSuppr);

    corps.appendChild(tr);
  });
  table.appendChild(corps);
  cartContent.appendChild(table);

  cartContent.appendChild(
    creer('p', 'Total : ' + formatPrix(cartTotal()), 'cart-total'),
  );

  const actions = creer('div', undefined, 'cart-actions');
  const vider = creer('button', 'Vider le panier', 'btn btn-secondary');
  vider.type = 'button';
  vider.addEventListener('click', () => {
    clearCart();
    renderCart();
  });
  const commander = creer('button', 'Commander', 'btn');
  commander.type = 'button';
  commander.addEventListener('click', () => {
    if (!getToken()) {
      cartStatus.textContent = 'Connectez-vous pour passer commande.';
      return;
    }
    cartStatus.textContent =
      'La validation de la commande sera disponible à la prochaine étape.';
  });
  actions.append(vider, commander);
  cartContent.appendChild(actions);
}

renderCart();
