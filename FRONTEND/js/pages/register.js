// Page register.html : inscription
import './common.js';
import { API_URL } from '../modules/api.js';
import { showStatus } from '../modules/form-status.js';

const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    const f = registerForm.elements;

    if (f.password.value !== f.password2.value) {
      showStatus('Les mots de passe ne correspondent pas.', true);
      return;
    }

    showStatus('Création du compte...');
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
        showStatus('Compte créé ! Redirection vers la connexion...');
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      } else if (res.status === 409) {
        showStatus(
          'Cet email ou ce nom d’utilisateur est déjà utilisé.',
          true,
        );
      } else if (res.status === 400) {
        showStatus(
          'Données invalides (mot de passe : 8 caractères minimum).',
          true,
        );
      } else {
        showStatus('Erreur du serveur. Réessayez plus tard.', true);
      }
    } catch {
      showStatus(
        'Serveur indisponible. Vérifiez que le backend est lancé.',
        true,
      );
    }
  });
}
