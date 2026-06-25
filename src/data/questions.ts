import type { ProfileType } from '../types';

export interface Question {
  id: string;
  text: string;
  type: 'common' | 'specific';
}

export const COMMON_QUESTIONS: Question[] = [
  { id: 'c1', text: 'Décris-moi une journée type dans ton poste.', type: 'common' },
  { id: 'c2', text: 'Quelles sont tes 3 tâches les plus fréquentes ?', type: 'common' },
  { id: 'c3', text: "Qu'est-ce qui te prend le plus de temps pour le moins de valeur ?", type: 'common' },
  { id: 'c4', text: 'Si tu avais une baguette magique, tu automatiserais quoi demain matin ?', type: 'common' },
  { id: 'c5', text: 'Quels logiciels tu utilises au quotidien ? (noms exacts)', type: 'common' },
  { id: 'c6', text: 'Tu utilises des fichiers Excel ou cahiers perso en parallèle du système officiel ? Pour quoi ?', type: 'common' },
  { id: 'c7', text: 'Comment tu communiques avec les autres services / partenaires ? (téléphone, WhatsApp, email ?)', type: 'common' },
];

export const SPECIFIC_QUESTIONS: Record<ProfileType, Question[]> = {
  gestionnaire: [
    { id: 'g1', text: 'Guide-moi étape par étape sur un remboursement pharmacie classique.', type: 'specific' },
    { id: 'g2', text: "Comment se passe une pré-autorisation d'hospitalisation ? Qui valide, en combien de temps ?", type: 'specific' },
    { id: 'g3', text: 'Comment tu vérifies que la facture correspond au tableau de garanties du contrat ?', type: 'specific' },
    { id: 'g4', text: 'Comment fonctionne le tiers payant avec les cliniques conventionnées ? Quand est-ce que ça coince ?', type: 'specific' },
    { id: 'g5', text: 'Quels sont les motifs de rejet les plus fréquents ?', type: 'specific' },
    { id: 'g6', text: 'Quand tu hésites sur un dossier, quels 2-3 critères tu regardes en premier ?', type: 'specific' },
    { id: 'g7', text: 'Quel est le cas le plus compliqué que tu aies eu récemment ?', type: 'specific' },
    { id: 'g8', text: "Quand le process officiel ne marche pas, qu'est-ce que tu fais concrètement ?", type: 'specific' },
    { id: 'g9', text: 'Comment tu gères un assuré qui conteste un refus ?', type: 'specific' },
    { id: 'g10', text: "Comment tu gères les cas dans les zones sans connexion internet ?", type: 'specific' },
  ],
  actuaire: [
    { id: 'a1', text: 'Comment vous tarifez un contrat santé collectif au Sénégal ? Quelles variables ?', type: 'specific' },
    { id: 'a2', text: 'Quelles données historiques avez-vous ? Lesquelles manquent ?', type: 'specific' },
    { id: 'a3', text: 'Comment gérez-vous la tarification sans données fiables ?', type: 'specific' },
    { id: 'a4', text: 'Quel est le ratio S/P moyen sur le portefeuille santé ?', type: 'specific' },
    { id: 'a5', text: 'Comment provisionnez-vous selon les contraintes CIMA ?', type: 'specific' },
    { id: 'a6', text: 'Quels postes de soins pèsent le plus sur la sinistralité ?', type: 'specific' },
    { id: 'a7', text: 'Avez-vous des modèles prédictifs de sinistralité ?', type: 'specific' },
    { id: 'a8', text: 'Quels outils pour l\'analyse actuarielle ? (Excel, R, SAS, Python ?)', type: 'specific' },
    { id: 'a9', text: "D'où viennent vos données de sinistralité ? Format, qualité ?", type: 'specific' },
    { id: 'a10', text: 'Combien de temps pour produire une étude tarifaire complète ?', type: 'specific' },
  ],
  souscripteur: [
    { id: 's1', text: "Guide-moi sur le process complet d'une nouvelle adhésion santé.", type: 'specific' },
    { id: 's2', text: "Quels critères d'évaluation du risque ? Questionnaire médical, visite, antécédents ?", type: 'specific' },
    { id: 's3', text: "Comment tu décides d'appliquer une exclusion ou surprime ? Quels seuils ?", type: 'specific' },
    { id: 's4', text: 'Quels cas tu refuses systématiquement ? Zone grise ?', type: 'specific' },
    { id: 's5', text: 'Comment tu gères les fausses déclarations post-souscription ?', type: 'specific' },
    { id: 's6', text: 'Quels documents exigés ? Lesquels souvent manquants ou falsifiés ?', type: 'specific' },
    { id: 's7', text: 'Spécificités culturelles sénégalaises impactant la souscription ? (polygamie, familles élargies, ayants droit)', type: 'specific' },
  ],
  fraude: [
    { id: 'f1', text: 'Quels sont les 3 schémas de fraude les plus fréquents au Sénégal en santé ?', type: 'specific' },
    { id: 'f2', text: 'Différence fraude assuré vs fraude prestataire ?', type: 'specific' },
    { id: 'f3', text: 'Quels red flags te mettent en alerte immédiatement ?', type: 'specific' },
    { id: 'f4', text: 'Comment tu détectes la surfacturation ? Tu compares à quoi ?', type: 'specific' },
    { id: 'f5', text: 'Réseaux organisés de prestataires complices ? Comment les identifier ?', type: 'specific' },
    { id: 'f6', text: 'Coût estimé de la fraude sur le portefeuille ?', type: 'specific' },
    { id: 'f7', text: 'Quelles données manquent pour mieux détecter ?', type: 'specific' },
    { id: 'f8', text: 'Actions quand fraude confirmée ? (sanctions, poursuites, déconventionnement)', type: 'specific' },
  ],
  commercial: [
    { id: 'co1', text: "Cycle de vente d'un contrat collectif santé, du premier contact à la signature.", type: 'specific' },
    { id: 'co2', text: 'Objections les plus fréquentes des entreprises ? Comment tu y réponds ?', type: 'specific' },
    { id: 'co3', text: "Qu'est-ce qui fait qu'un client vous choisit vs un concurrent ?", type: 'specific' },
    { id: 'co4', text: 'Causes principales de résiliation ? Signaux de churn ?', type: 'specific' },
    { id: 'co5', text: 'Comment les DRH/DAF évaluent leur contrat santé ?', type: 'specific' },
    { id: 'co6', text: 'Comment les assurés perçoivent leur couverture ? Plaintes fréquentes ?', type: 'specific' },
    { id: 'co7', text: 'Recouvrement des primes : problèmes de paiement ?', type: 'specific' },
    { id: 'co8', text: 'Mobile money (Orange Money, Wave) pour le paiement des primes ?', type: 'specific' },
  ],
  dsi: [
    { id: 'd1', text: 'Quel SI cœur pour gestion contrats et sinistres ? (nom, éditeur, version)', type: 'specific' },
    { id: 'd2', text: 'Briques applicatives du paysage SI santé ? Comment elles communiquent ?', type: 'specific' },
    { id: 'd3', text: 'Données structurées vs non structurées ? Format, qualité ?', type: 'specific' },
    { id: 'd4', text: 'API ouvertes ? Possibilités d\'intégration externe ?', type: 'specific' },
    { id: 'd5', text: 'Gestion des contraintes de connectivité internet ? Mode offline ?', type: 'specific' },
    { id: 'd6', text: 'Niveau de maturité data ? (data warehouse, BI, data lake, ou Excel partout ?)', type: 'specific' },
    { id: 'd7', text: "Projets de digitalisation qui ont échoué ? Pourquoi ?", type: 'specific' },
    { id: 'd8', text: "Freins à l'adoption des outils digitaux par les équipes métier ?", type: 'specific' },
    { id: 'd9', text: "Contraintes sécurité/conformité pour intégrer un SaaS tiers ?", type: 'specific' },
  ],
  suivi_contrat: [
    { id: 'sc1', text: "Combien d'avenants traites-tu par semaine, tous types confondus ?", type: 'specific' },
    { id: 'sc2', text: "Y a-t-il des pics saisonniers ou des périodes où le volume explose ?", type: 'specific' },
    { id: 'sc3', text: "Y a-t-il un backlog d'avenants en attente ? Quelle taille en moyenne ?", type: 'specific' },
    { id: 'sc4', text: "Quel est le délai moyen entre la réception d'une demande et l'édition finale de l'avenant ?", type: 'specific' },
    { id: 'sc5', text: "Quelle proportion de ton travail est manuelle vs automatisée par le SI actuel ?", type: 'specific' },
    { id: 'sc6', text: "Combien d'applications ou de fichiers ouvres-tu en parallèle pour traiter un seul avenant ?", type: 'specific' },
    { id: 'sc7', text: "Quelles sont les erreurs les plus fréquentes et comment sont-elles détectées ? Quel impact quand ça arrive ?", type: 'specific' },
    { id: 'sc8', text: "Les demandes d'avenant viennent de qui et comment tu les reçois ? (email, papier, appel, logiciel)", type: 'specific' },
    { id: 'sc9', text: "Avec quels autres postes ou services interagis-tu le plus et comment se fait l'échange ?", type: 'specific' },
    { id: 'sc10', text: "Y a-t-il des situations où tu dois attendre une validation d'un autre poste avant de finaliser ? Combien de temps ça prend ?", type: 'specific' },
    { id: 'sc11', text: "Si tu pouvais changer une seule chose dans ta façon de travailler, ce serait quoi ?", type: 'specific' },
  ],
  direction: [
    { id: 'di1', text: 'Évolution du marché santé sénégalais sur 3-5 ans ?', type: 'specific' },
    { id: 'di2', text: 'Segments sous-assurés = opportunités ?', type: 'specific' },
    { id: 'di3', text: 'Impact de la CMU sur le business privé ?', type: 'specific' },
    { id: 'di4', text: 'Principaux concurrents et différenciation ?', type: 'specific' },
    { id: 'di5', text: 'Ratio combiné du portefeuille santé ? Évolution ?', type: 'specific' },
    { id: 'di6', text: "Coût moyen de gestion d'un sinistre santé ?", type: 'specific' },
    { id: 'di7', text: '3 leviers prioritaires pour améliorer la rentabilité ?', type: 'specific' },
    { id: 'di8', text: 'Coût estimé de la fraude ?', type: 'specific' },
    { id: 'di9', text: "Willingness to pay pour un outil qui réduit le temps de traitement de 50% ?", type: 'specific' },
    { id: 'di10', text: "Position sur l'IA dans l'assurance ? Projets en cours ?", type: 'specific' },
    { id: 'di11', text: 'Critères build vs buy pour un outil tech ?', type: 'specific' },
    { id: 'di12', text: "Qui valide l'achat d'un outil tech ? Process d'achat ?", type: 'specific' },
  ],
};

export const PROFILE_META: Record<ProfileType, { label: string; emoji: string; color: string; accent: string }> = {
  gestionnaire: { label: 'Gestionnaire de prestations', emoji: '📋', color: '#3b82f6', accent: '#1d4ed8' },
  actuaire:     { label: 'Actuaire / Tarificateur',     emoji: '📊', color: '#8b5cf6', accent: '#6d28d9' },
  souscripteur: { label: 'Souscripteur',                emoji: '🔍', color: '#f59e0b', accent: '#d97706' },
  fraude:       { label: 'Responsable fraude',          emoji: '🛡️', color: '#ef4444', accent: '#b91c1c' },
  commercial:   { label: 'Commercial / Sales',          emoji: '💼', color: '#10b981', accent: '#047857' },
  dsi:          { label: 'DSI / IT',                    emoji: '🖥️', color: '#06b6d4', accent: '#0e7490' },
  direction:    { label: 'Direction / Décideurs',       emoji: '👔', color: '#f97316', accent: '#c2410c' },
  suivi_contrat: { label: 'Gestionnaire Suivi de Contrat', emoji: '📝', color: '#14b8a6', accent: '#0f766e' },
};

export const ALL_PROFILES: ProfileType[] = [
  'gestionnaire', 'actuaire', 'souscripteur', 'fraude', 'commercial', 'dsi', 'direction', 'suivi_contrat',
];

export function getQuestionsForProfile(profile: ProfileType): Question[] {
  return [...COMMON_QUESTIONS, ...SPECIFIC_QUESTIONS[profile]];
}
