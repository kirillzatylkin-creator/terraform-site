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
    boutonMenu.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
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

  // Échap ferme le menu et remet le clavier sur le bouton.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && menu.classList.contains('ouvert')) {
      boutonMenu.focus();
      changerMenu(false);
    }
  });

  // Réinitialiser le menu quand on passe entre mobile et ordinateur.
  mobile.addEventListener('change', () => {
    if (mobile.matches && menu.contains(document.activeElement)) boutonMenu.focus();
    if (!mobile.matches && document.activeElement === boutonMenu) document.querySelector('.nav-logo').focus();
    changerMenu(false);
  });
}

// FILTRES : une même fonction pour la galerie et la boutique.
function activerFiltres(selecteurBoutons, selecteurCartes, selecteurMessage) {
  const boutons = document.querySelectorAll(selecteurBoutons);
  const cartes = document.querySelectorAll(selecteurCartes);
  const message = document.querySelector(selecteurMessage);
  if (!boutons.length || !message) return;

  function filtrer(boutonActif) {
    const filtre = boutonActif.dataset.filter;
    let nombre = 0;

    cartes.forEach(carte => {
      const categories = carte.dataset.category.split(' ');
      carte.hidden = filtre !== 'all' && !categories.includes(filtre);
      if (!carte.hidden) nombre++;
    });

    boutons.forEach(bouton => {
      const actif = bouton === boutonActif;
      bouton.classList.toggle('active', actif);
      bouton.setAttribute('aria-pressed', String(actif));
    });

    message.textContent = 'Résultats affichés : ' + nombre;
    if (nombre === 0) message.textContent = 'Aucun résultat dans cette catégorie pour le moment.';
  }

  boutons.forEach(bouton => {
    bouton.addEventListener('click', () => filtrer(bouton));
  });
  filtrer(boutons[0]);
}

activerFiltres('.filter-btn', '.g-item', '#gallery-status');
activerFiltres('.tab-btn', '.product-card', '#store-status');
