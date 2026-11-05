// Page contact.html : envoi du formulaire de contact au backend
import './common.js';
import { API_URL } from '../modules/api.js';

const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    const f = contactForm.elements;
    const bouton = contactForm.querySelector('.form-submit');

    bouton.disabled = true;
    contactStatus.textContent = 'Envoi en cours...';

    try {
      const res = await fetch(API_URL + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f['name'].value.trim(),
          email: f['email'].value.trim(),
          subject: f['subject'].value,
          message: f['message'].value.trim(),
        }),
      });

      if (res.ok) {
        contactForm.reset();
        contactStatus.textContent = 'Merci ! Votre message a bien été envoyé.';
      } else if (res.status === 400) {
        contactStatus.textContent =
          'Veuillez vérifier les champs du formulaire.';
      } else {
        contactStatus.textContent = 'Erreur du serveur. Réessayez plus tard.';
      }
    } catch {
      contactStatus.textContent = 'Serveur indisponible. Réessayez plus tard.';
    } finally {
      bouton.disabled = false;
    }
  });

  contactForm.addEventListener('input', () => {
    contactStatus.textContent = '';
  });
}
