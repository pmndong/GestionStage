// ─── INTERVIEWS ───────────────────────────────────────────────────────────────

export type ProfileType =
  | 'gestionnaire'
  | 'actuaire'
  | 'souscripteur'
  | 'fraude'
  | 'commercial'
  | 'dsi'
  | 'direction';

export interface QuestionAnswer {
  questionId: string;
  answer: string;
}

export interface Interview {
  id: string;
  profileType: ProfileType;
  intervieweeName: string;
  poste: string;
  anciennete: string;
  entreprise: string;
  date: string;
  answers: QuestionAnswer[];
  metriques: Metrique[];
  createdAt: string;
  updatedAt: string;
}

// ─── OBSERVATION TERRAIN ──────────────────────────────────────────────────────

export interface ObservationSession {
  id: string;
  date: string;
  profileObserve: string;
  duree: string;
  entreprise: string;
  tacheObservee: string;
  etapesReelles: string;
  outilsUtilises: string;
  ecartsProcessOfficiel: string;
  frustrations: string;
  opportuniteAutomatisation: string;
  scoreImpact: number;
  scoreFaisabilite: number;
  // Champs quantitatifs
  tempsReel?: number; // en minutes
  nbPersonnes?: number;
  frequenceParSemaine?: number;
  moduleConcerne?: ModuleConcerne;
  createdAt: string;
}

// ─── CARTOGRAPHIE PROCESSUS ───────────────────────────────────────────────────

export type PrioriteType = 'P1' | 'P2' | 'P3';

export interface Processus {
  id: string;
  mode: 'questionnaire' | 'workflow';
  nom: string;
  acteurPrincipal: string;
  frequence: string;
  tempsMoyen: string;
  reglesExplicites: string;
  reglesTacites: string;
  painPoints: string;
  potentielAgent: string;
  priorite: PrioriteType;
  workflowData?: string; // JSON serialized nodes + edges (mode workflow only)
  createdAt: string;
  updatedAt: string;
}

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes: string;
}

// ─── DICTIONNAIRE METIER ──────────────────────────────────────────────────────

export type DictCategorie =
  | 'reglementaire'
  | 'operationnel'
  | 'technique'
  | 'commercial'
  | 'wolof';

export interface DictEntry {
  id: string;
  terme: string;
  definition: string;
  categorie: DictCategorie;
  source: string;
  createdAt: string;
  updatedAt: string;
}

// ─── METRIQUES ────────────────────────────────────────────────────────────────

export type ModuleConcerne = 'fraude' | 'dashboard' | 'indemnisation' | 'general';
export type UniteMetrique = 'minutes' | 'heures' | 'jours' | 'FCFA' | '%' | 'dossiers' | 'personnes' | 'autre';
export type FrequenceMetrique = 'par dossier' | 'par jour' | 'par semaine' | 'par mois' | 'par an';

export interface Metrique {
  id: string;
  label: string;
  valeur: number;
  unite: UniteMetrique;
  frequence: FrequenceMetrique;
  module: ModuleConcerne;
  sourceInterviewId?: string;
  sourceObservationId?: string;
  notes: string;
  createdAt: string;
}

// ─── PLANNING ─────────────────────────────────────────────────────────────────

export type StatutSemaine = 'a_venir' | 'en_cours' | 'termine';

export interface SemaineObjectif {
  questionId: string;
  done: boolean;
}

export interface JourDetail {
  jour: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  taches: string[];
}

export interface PlanningWeek {
  semaine: number; // 1-12
  phase: 1 | 2 | 3;
  titre: string;
  dateDebut: string; // ISO date string
  dateFin: string;   // ISO date string
  objectifs: string[];
  joursDetails: JourDetail[];
  livrable?: string;
  statut: StatutSemaine;
  apprentissages: string;
  objectifsDone: boolean[];
  createdAt: string;
  updatedAt: string;
}

// ─── NOTES ────────────────────────────────────────────────────────────────────

export type NoteCouleur = 'jaune' | 'bleu' | 'vert' | 'rouge' | 'violet';

export interface Note {
  id: string;
  titre: string;
  contenu: string;
  couleur: NoteCouleur;
  createdAt: string;
  updatedAt: string;
}

// ─── STORE ────────────────────────────────────────────────────────────────────

export interface AppStore {
  interviews: Interview[];
  observations: ObservationSession[];
  processus: Processus[];
  checklist: ChecklistItem[];
  dictionnaire: DictEntry[];
  metriques: Metrique[];
  planning: PlanningWeek[];
  notes: Note[];
}
