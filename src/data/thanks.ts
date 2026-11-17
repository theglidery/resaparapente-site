// Content of the thank-you pages shown after a booking request (/merci/passager/ and /merci/stagiaire/).
// Edit here: voucher, guides, logbook and goodies. Nothing else has to change.
export const THANKS = {
  shop: { name: 'MonParapente.fr', url: 'https://monparapente.fr/' },
  // Discount voucher for MonParapente.fr. TO VALIDATE BEFORE LAUNCH: amount, code, validity and the products it applies to must exist in the shop.
  voucher: {
    amount: '10 %',                 // shown as "un bon de réduction de 10 %"
    code: 'RESA10',                 // code to create in the shop
    scope: 'sur une sélection d’articles de MonParapente.fr',
    until: null as string | null,   // e.g. '2027-06-30'; null = no end date shown
    url: 'https://monparapente.fr/',
  },
  guides: {
    passager: { file: '/documents/guide-passager-parapente.pdf', title: 'Guide du passager', pages: '6 pages', text: 'Le déroulé de la journée, la tenue, les sensations, l’âge et le poids, la météo, l’annulation : tout pour bien préparer votre vol.' },
    stagiaire: { file: '/documents/guide-stagiaire-parapente.pdf', title: 'Guide du stagiaire', pages: '13 pages, avec liens', text: 'Préparer son premier stage, la théorie en 6 modules (vent, météo, matériel, décollage, atterrissage, sécurité), les brevets et la licence, avec des liens pour approfondir.' },
  },
  logbook: { file: '/documents/carnet-de-progression-parapente.pdf', title: 'Carnet de vol du stagiaire', pages: '8 pages à imprimer', text: 'Notez vos séances, vos vols et les exercices travaillés : votre moniteur peut le viser à la fin de chaque journée.' },
  // Goodies announced for students. status: 'soon' (shown without a buy link) or 'online' (set url to the product page).
  goodies: [
    { name: 'T-shirt MonParapente', status: 'soon' as 'soon' | 'online', url: 'https://monparapente.fr/' },
    { name: 'Bandana MonParapente', status: 'soon' as 'soon' | 'online', url: 'https://monparapente.fr/' },
  ],
};

// Christmas / New Year special offer (Locawing). Replace `promoCode` and the 2 `url`s once live on locawing.fr.
export const CHRISTMAS_OFFER = {
  enabled: true,
  promoCode: 'NOEL10',
  discount: { FR: '10 €', BE: '10 €', CH: '10 CHF' } as const,
  products: [
    { nameFr: 'T-shirt de parapente', nameEn: 'Paragliding T-shirt', nameDe: 'Gleitschirm-T-Shirt', url: 'https://locawing.fr/' },
    { nameFr: 'Tour de cou « Je vole »', nameEn: '“Je vole” Neck Warmer', nameDe: 'Schlauchschal « Je vole »', url: 'https://locawing.fr/' },
  ],
};
