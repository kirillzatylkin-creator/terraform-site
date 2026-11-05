// Messages des formulaires de connexion / inscription (#auth-status)
export function showStatus(texte, erreur = false) {
  const authStatus = document.getElementById('auth-status');
  if (!authStatus) return;
  authStatus.textContent = texte;
  authStatus.classList.toggle('error', erreur);
}
