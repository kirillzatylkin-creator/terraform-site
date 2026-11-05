// MENU BURGER
// Le HTML contient le bouton. Le CSS affiche le menu avec la classe "ouvert".

export function initMenu() {
  const boutonMenu = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-links');
  if (!boutonMenu || !menu) return;

  const mobile = window.matchMedia('(max-width: 768px)');
  boutonMenu.closest('nav').classList.add('nav-enhanced');

  function setMenuOpen(ouvert) {
    menu.classList.toggle('ouvert', ouvert);
    boutonMenu.setAttribute('aria-expanded', String(ouvert));
    boutonMenu.setAttribute(
      'aria-label',
      ouvert ? 'Fermer le menu' : 'Ouvrir le menu',
    );
  }

  boutonMenu.addEventListener('click', () => {
    setMenuOpen(!menu.classList.contains('ouvert'));
  });

  menu.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a')) {
      boutonMenu.focus();
      setMenuOpen(false);
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
      setMenuOpen(false);
    }
  });

  // Réinitialiser le menu quand on passe entre mobile et ordinateur
  mobile.addEventListener('change', () => {
    if (mobile.matches && menu.contains(document.activeElement))
      boutonMenu.focus();
    if (!mobile.matches && document.activeElement === boutonMenu)
      document.querySelector('.nav-logo').focus();
    setMenuOpen(false);
  });
}

// LIEN D'ÉVITEMENT « Aller au contenu »
export function initSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('main-content');
  if (!skipLink || !mainContent) return;

  skipLink.addEventListener('click', event => {
    event.preventDefault();

    mainContent.focus({ preventScroll: true });
    mainContent.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    });
  });
}
