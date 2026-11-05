// PANIER (localStorage) : données du panier + lien « Panier (n) » dans le menu

const MAX_QUANTITE = 10;

export function getCart() {
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

export function addToCart(produit) {
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

export function setQuantity(id, quantity) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(l => l.id !== id);
  } else {
    const ligne = cart.find(l => l.id === id);
    if (ligne) ligne.quantity = Math.min(quantity, MAX_QUANTITE);
  }
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

function cartCount() {
  return getCart().reduce((somme, l) => somme + l.quantity, 0);
}

export function cartTotal() {
  return getCart().reduce((somme, l) => somme + l.price * l.quantity, 0);
}

function updateCartCount() {
  const lien = document.getElementById('cart-link');
  if (!lien) return;

  const nombre = cartCount();
  if (nombre > 0) {
    lien.textContent = 'Panier (' + nombre + ')';
  } else {
    lien.textContent = 'Panier';
  }
}

export function addCartLink() {
  updateCartCount();
}
