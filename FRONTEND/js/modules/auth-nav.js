// Liens du menu : Connexion / Inscription ou Déconnexion
import { getUser, logout } from './api.js';



export function renderAuthNav() {
  const lienConnexion = document.getElementById('nav-login');
  const lienInscription = document.getElementById('nav-register');
  if (!lienConnexion || !lienInscription) return;

  
  const user = getUser();
  if (!user) return;
  


  lienInscription.parentElement.hidden = true;


  const nom = user.username || user.name || user.email;
  lienConnexion.textContent = 'Déconnexion (' + nom + ')';
  lienConnexion.href = '#';
  lienConnexion.classList.remove('active');
  lienConnexion.removeAttribute('aria-current');


  lienConnexion.addEventListener('click', event => {
    event.preventDefault();
    logout();
  });
  
}
