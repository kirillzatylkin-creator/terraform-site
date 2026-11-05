// Page login.html : connexion
import './common.js';
import { API_URL, saveSession } from '../modules/api.js';
import { showStatus } from '../modules/form-status.js';

const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;

    showStatus('Connexion en cours...');
    try {
      const res = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        saveSession(data.token, data.user || { email });
        window.location.href = 'index.html';
      } else if (res.status === 401) {
        showStatus('Email ou mot de passe incorrect.', true);
      } else if (res.status === 400) {
        showStatus('Veuillez remplir tous les champs.', true);
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
