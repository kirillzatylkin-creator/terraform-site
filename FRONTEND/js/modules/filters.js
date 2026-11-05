// FILTRES : une même fonction pour la galerie et la boutique
export function setupFilters(buttonSelector, cardSelector, resultMessageSelector) {
  const boutons = document.querySelectorAll(buttonSelector);

  const message = document.querySelector(resultMessageSelector);
  if (!boutons.length || !message) return;

  function filterCards(boutonActif) {
    // Relu à chaque filtre : les cartes peuvent être ajoutées par le JS
    const cartes = document.querySelectorAll(cardSelector);
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
    bouton.addEventListener('click', () => filterCards(bouton));
  });
  filterCards(boutons[0]);
}
