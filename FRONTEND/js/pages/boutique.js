// Page boutique.html : produits depuis la base de données + filtres
import './common.js';
import { setupFilters } from '../modules/filters.js';
import { API_URL } from '../modules/api.js';
import { formatPrice } from '../modules/format.js';
import { addToCart } from '../modules/cart-store.js';

setupFilters('.tab-btn', '.product-card', '#store-status');

const productsGrid = document.getElementById('products-grid');

function createProductCard(produit) {
  const carte = document.createElement('div');
  carte.className = 'product-card';
  carte.dataset.category = produit.category;

  const zoneImage = document.createElement('div');
  zoneImage.className = 'product-img';
  const image = document.createElement('img');
  image.src = produit.image || 'images/03-fond-chateau.webp';
  image.alt = produit.name;
  image.loading = 'lazy';
  zoneImage.appendChild(image);

  const info = document.createElement('div');
  info.className = 'product-info';

  const nom = document.createElement('h3');
  nom.className = 'product-type';
  nom.textContent = produit.name;

  const description = document.createElement('p');
  description.className = 'product-description';
  description.textContent = produit.description || '';

  const prix = document.createElement('p');
  prix.className = 'product-price';
  prix.textContent = formatPrice(produit.price);

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

async function loadProducts() {
  try {
    const res = await fetch(API_URL + '/products');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const produits = await res.json();

    productsGrid.replaceChildren(...produits.map(createProductCard));

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

if (productsGrid) loadProducts();
