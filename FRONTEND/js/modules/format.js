// Prix au format français : 19.9 → « 19,90 € »
export function formatPrice(valeur) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(valeur));
}
