// THÈME CLAIR / SOMBRE
// Le petit script dans le <head> applique déjà le thème avant l'affichage
// (sinon la page clignoterait). Ce module ajoute le bouton pour en changer.

export function initTheme() {
  const racine = document.documentElement; // la balise <html>
  const systemeSombre = window.matchMedia('(prefers-color-scheme: dark)');

  const boutonTheme = document.querySelector('.theme-toggle');
  if (!boutonTheme) return;

  // Lit le choix enregistré (localStorage peut être bloqué en navigation privée)
  function readSavedTheme() {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    racine.dataset.theme = theme; // → <html data-theme="dark"> ou "light"
    boutonTheme.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  //  choix enregistré,  réglage du système,  clair par défaut
  applyTheme(readSavedTheme() || (systemeSombre.matches ? 'dark' : 'light'));

  boutonTheme.addEventListener('click', () => {
    const nouveauTheme = racine.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nouveauTheme);
    try {
      localStorage.setItem('theme', nouveauTheme);
    } catch {
      // pas d'enregistrement possible : le thème change quand même pour cette page
    }
  });

 
}
