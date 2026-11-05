// Page cart.html : affichage et modification du panier
import './common.js';
import { getToken } from '../modules/api.js';
import { formatPrice } from '../modules/format.js';
import {
  getCart,
  setQuantity,
  clearCart,
  cartTotal,
} from '../modules/cart-store.js';

const cartContent = document.getElementById('cart-content');
const cartStatus = document.getElementById('cart-status');

function createEl(tag, texte, classe) {
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
    const vide = createEl('p', 'Votre panier est vide. ');
    const lien = createEl('a', 'Voir la boutique');
    lien.href = 'boutique.html';
    vide.appendChild(lien);
    cartContent.appendChild(vide);
    return;
  }

  const table = createEl('table', undefined, 'cart-table');
  const entete = createEl('thead');
  const trEntete = createEl('tr');
  ['Produit', 'Prix', 'Quantité', 'Sous-total', ''].forEach(t =>
    trEntete.appendChild(createEl('th', t)),
  );
  entete.appendChild(trEntete);
  table.appendChild(entete);

  const corps = createEl('tbody');
  cart.forEach(ligne => {
    const tr = createEl('tr');
    tr.appendChild(createEl('td', ligne.name));
    tr.appendChild(createEl('td', formatPrice(ligne.price)));

    const tdQte = createEl('td');
    const moins = createEl('button', '−', 'qty-btn');
    moins.type = 'button';
    moins.addEventListener('click', () => {
      setQuantity(ligne.id, ligne.quantity - 1);
      renderCart();
    });
    const plus = createEl('button', '+', 'qty-btn');
    plus.type = 'button';
    plus.addEventListener('click', () => {
      setQuantity(ligne.id, ligne.quantity + 1);
      renderCart();
    });
    tdQte.append(
      moins,
      createEl('span', String(ligne.quantity), 'qty-value'),
      plus,
    );
    tr.appendChild(tdQte);

    tr.appendChild(createEl('td', formatPrice(ligne.price * ligne.quantity)));

    const tdSuppr = createEl('td');
    const suppr = createEl('button', 'Retirer', 'qty-btn');
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
    createEl('p', 'Total : ' + formatPrice(cartTotal()), 'cart-total'),
  );

  const actions = createEl('div', undefined, 'cart-actions');
  const vider = createEl('button', 'Vider le panier', 'btn btn-secondary');
  vider.type = 'button';
  vider.addEventListener('click', () => {
    clearCart();
    renderCart();
  });
  const commander = createEl('button', 'Commander', 'btn');
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
