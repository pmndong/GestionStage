import type { AppStore, Interview, ObservationSession, Processus, ChecklistItem, DictEntry, Metrique, PlanningWeek, Note } from '../types';
import { DEFAULT_CHECKLIST } from '../data/checklist';
import { DEFAULT_PLANNING } from '../data/planning';

const STORAGE_KEY = 'gererstage_data';

function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppStore;
      if (!parsed.checklist || parsed.checklist.length === 0) {
        parsed.checklist = DEFAULT_CHECKLIST;
      }
      if (!parsed.metriques) parsed.metriques = [];
      if (!parsed.notes) parsed.notes = [];
      if (!parsed.planning || parsed.planning.length === 0) {
        parsed.planning = DEFAULT_PLANNING;
      } else {
        // Migrate: add dateDebut/dateFin if missing
        parsed.planning = parsed.planning.map((w) => {
          const def = DEFAULT_PLANNING.find((d) => d.semaine === w.semaine);
          return {
            ...w,
            dateDebut: w.dateDebut ?? def?.dateDebut ?? '',
            dateFin: w.dateFin ?? def?.dateFin ?? '',
            joursDetails: w.joursDetails ?? def?.joursDetails ?? [],
          };
        });
      }
      // Migrate interviews: ensure metriques field exists
      parsed.interviews = (parsed.interviews || []).map((iv) => ({
        ...iv,
        metriques: iv.metriques || [],
      }));
      return parsed;
    }
  } catch {
    // ignore
  }
  return {
    interviews: [],
    observations: [],
    processus: [],
    checklist: DEFAULT_CHECKLIST,
    dictionnaire: [],
    metriques: [],
    planning: DEFAULT_PLANNING,
    notes: [],
  };
}

function saveStore(store: AppStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();
let store = loadStore();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getStore(): AppStore {
  return store;
}

function mutate(updater: (s: AppStore) => void) {
  updater(store);
  saveStore(store);
  notify();
}

// ─── Interviews ───────────────────────────────────────────────────────────────

export function saveInterview(interview: Interview) {
  mutate((s) => {
    const idx = s.interviews.findIndex((i) => i.id === interview.id);
    if (idx >= 0) {
      s.interviews[idx] = interview;
    } else {
      s.interviews.unshift(interview);
    }
  });
}

export function deleteInterview(id: string) {
  mutate((s) => {
    s.interviews = s.interviews.filter((i) => i.id !== id);
  });
}

// ─── Observations ─────────────────────────────────────────────────────────────

export function saveObservation(obs: ObservationSession) {
  mutate((s) => {
    const idx = s.observations.findIndex((o) => o.id === obs.id);
    if (idx >= 0) {
      s.observations[idx] = obs;
    } else {
      s.observations.unshift(obs);
    }
  });
}

export function deleteObservation(id: string) {
  mutate((s) => {
    s.observations = s.observations.filter((o) => o.id !== id);
  });
}

// ─── Processus ────────────────────────────────────────────────────────────────

export function saveProcessus(p: Processus) {
  mutate((s) => {
    const idx = s.processus.findIndex((x) => x.id === p.id);
    if (idx >= 0) {
      s.processus[idx] = p;
    } else {
      s.processus.unshift(p);
    }
  });
}

export function deleteProcessus(id: string) {
  mutate((s) => {
    s.processus = s.processus.filter((p) => p.id !== id);
  });
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export function updateChecklistItem(item: ChecklistItem) {
  mutate((s) => {
    const idx = s.checklist.findIndex((c) => c.id === item.id);
    if (idx >= 0) s.checklist[idx] = item;
  });
}

// ─── Dictionnaire ─────────────────────────────────────────────────────────────

export function saveDictEntry(entry: DictEntry) {
  mutate((s) => {
    const idx = s.dictionnaire.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      s.dictionnaire[idx] = entry;
    } else {
      s.dictionnaire.unshift(entry);
    }
  });
}

export function deleteDictEntry(id: string) {
  mutate((s) => {
    s.dictionnaire = s.dictionnaire.filter((e) => e.id !== id);
  });
}

// ─── Métriques ────────────────────────────────────────────────────────────────

export function saveMetrique(m: Metrique) {
  mutate((s) => {
    const idx = s.metriques.findIndex((x) => x.id === m.id);
    if (idx >= 0) {
      s.metriques[idx] = m;
    } else {
      s.metriques.unshift(m);
    }
  });
}

export function deleteMetrique(id: string) {
  mutate((s) => {
    s.metriques = s.metriques.filter((m) => m.id !== id);
  });
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function saveNote(note: Note) {
  mutate((s) => {
    const idx = s.notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      s.notes[idx] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      s.notes.unshift(note);
    }
  });
}

export function deleteNote(id: string) {
  mutate((s) => {
    s.notes = s.notes.filter((n) => n.id !== id);
  });
}

// ─── Planning ─────────────────────────────────────────────────────────────────

export function updatePlanningWeek(week: PlanningWeek) {
  mutate((s) => {
    const idx = s.planning.findIndex((w) => w.semaine === week.semaine);
    if (idx >= 0) {
      s.planning[idx] = { ...week, updatedAt: new Date().toISOString() };
    }
  });
}
