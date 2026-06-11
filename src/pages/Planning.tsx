import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Calendar, Trophy, CalendarDays } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { updatePlanningWeek } from '../lib/store';
import type { PlanningWeek, StatutSemaine } from '../types';
import { Textarea } from '../components/ui';

const PHASE_LABELS: Record<1 | 2 | 3, { label: string; color: string; bg: string; desc: string }> = {
  1: { label: 'Phase 1', color: '#3b82f6', bg: '#eff6ff', desc: 'Immersion & cartographie terrain' },
  2: { label: 'Phase 2', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Validation & calibrage' },
  3: { label: 'Phase 3', color: '#f97316', bg: '#fff7ed', desc: 'Reconstruction MVP & packaging commercial' },
};

const STATUT_CONFIG: Record<StatutSemaine, { label: string; color: string; bg: string }> = {
  a_venir:  { label: 'À venir',    color: '#94a3b8', bg: '#f1f5f9' },
  en_cours: { label: 'En cours',   color: '#f59e0b', bg: '#fffbeb' },
  termine:  { label: 'Terminée',   color: '#10b981', bg: '#ecfdf5' },
};

function WeekCard({ week }: { week: PlanningWeek }) {
  const [expanded, setExpanded] = useState(false);
  const phase = PHASE_LABELS[week.phase];
  const statut = STATUT_CONFIG[week.statut];
  const donePct = week.objectifsDone.length > 0
    ? Math.round((week.objectifsDone.filter(Boolean).length / week.objectifsDone.length) * 100)
    : 0;

  const handleStatut = (s: StatutSemaine) => {
    updatePlanningWeek({ ...week, statut: s });
  };

  const handleObjectif = (idx: number) => {
    const newDone = [...week.objectifsDone];
    newDone[idx] = !newDone[idx];
    updatePlanningWeek({ ...week, objectifsDone: newDone });
  };

  const handleApprentissages = (val: string) => {
    updatePlanningWeek({ ...week, apprentissages: val });
  };

  return (
    <div className={`rounded-xl border transition-all ${week.statut === 'termine' ? 'border-green-200 bg-green-50/50' : 'border-slate-200 bg-white'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
          style={{ background: phase.color }}>
          S{week.semaine}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{week.titre}</span>
            {week.livrable && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: phase.bg, color: phase.color }}>
                📎 Livrable
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs" style={{ color: phase.color }}>{phase.label} — {phase.desc}</span>
            {week.dateDebut && (
              <span className="text-xs text-slate-400">
                {new Date(week.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' → '}
                {new Date(week.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, background: phase.color }} />
          </div>
          <span className="text-xs text-slate-400 w-8">{donePct}%</span>
        </div>
        {/* Statut badge */}
        <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
          style={{ background: statut.bg, color: statut.color }}>
          {statut.label}
        </span>
        {expanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
          {/* Statut selector */}
          <div className="flex gap-2">
            {(Object.keys(STATUT_CONFIG) as StatutSemaine[]).map((s) => (
              <button key={s}
                onClick={() => handleStatut(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${week.statut === s ? 'border-current' : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                style={week.statut === s ? { background: STATUT_CONFIG[s].bg, color: STATUT_CONFIG[s].color } : {}}>
                {STATUT_CONFIG[s].label}
              </button>
            ))}
          </div>

          {/* Objectifs */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Objectifs de la semaine</p>
            <div className="space-y-2">
              {week.objectifs.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2 cursor-pointer group" onClick={() => handleObjectif(idx)}>
                  <div className="mt-0.5 flex-shrink-0">
                    {week.objectifsDone[idx]
                      ? <CheckCircle2 size={16} className="text-green-500" />
                      : <Circle size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />}
                  </div>
                  <span className={`text-sm leading-relaxed ${week.objectifsDone[idx] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {obj}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Livrable */}
          {week.livrable && (
            <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: phase.bg }}>
              <Trophy size={14} style={{ color: phase.color }} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: phase.color }}>Livrable attendu</p>
                <p className="text-xs text-slate-600">{week.livrable}</p>
              </div>
            </div>
          )}

          {/* Plan journalier */}
          {week.joursDetails && week.joursDetails.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CalendarDays size={12} /> Plan journalier
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {week.joursDetails.map((jour) => (
                  <div key={jour.jour} className="rounded-lg p-2.5" style={{ background: phase.bg, borderLeft: `3px solid ${phase.color}` }}>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: phase.color }}>{jour.jour}</p>
                    <ul className="space-y-1">
                      {jour.taches.map((t, i) => (
                        <li key={i} className="text-xs text-slate-600 leading-snug flex gap-1">
                          <span className="mt-0.5 flex-shrink-0" style={{ color: phase.color }}>·</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apprentissages */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Apprentissages clés de la semaine
            </label>
            <Textarea
              rows={3}
              placeholder={`Règle d'or : "Qu'est-ce que j'ai appris cette semaine que je ne savais pas lundi ?"`}
              value={week.apprentissages}
              onChange={(e) => handleApprentissages(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Planning() {
  const store = useStore();
  const planning = store.planning;

  const totalObjectifs = planning.reduce((acc, w) => acc + w.objectifs.length, 0);
  const doneObjectifs = planning.reduce((acc, w) => acc + w.objectifsDone.filter(Boolean).length, 0);
  const semainesTerminees = planning.filter((w) => w.statut === 'termine').length;
  const semainesEnCours = planning.filter((w) => w.statut === 'en_cours').length;
  const globalPct = totalObjectifs > 0 ? Math.round((doneObjectifs / totalObjectifs) * 100) : 0;

  const phases = [1, 2, 3] as const;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Planning du stage</h1>
        <p className="text-slate-500 text-sm">Roadmap 12 semaines — 15 juin → 6 sept 2026 · AXA BU Santé</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-800">{globalPct}%</p>
          <p className="text-xs text-slate-500">Progression globale</p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#00b894] rounded-full transition-all" style={{ width: `${globalPct}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-green-600">{semainesTerminees}</p>
          <p className="text-xs text-slate-500">Semaines terminées</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-amber-500">{semainesEnCours}</p>
          <p className="text-xs text-slate-500">En cours</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-800">{doneObjectifs}<span className="text-slate-400 text-sm font-normal">/{totalObjectifs}</span></p>
          <p className="text-xs text-slate-500">Objectifs accomplis</p>
        </div>
      </div>

      {/* Semaines par phase */}
      {phases.map((phase) => {
        const phaseWeeks = planning.filter((w) => w.phase === phase);
        const phaseDone = phaseWeeks.reduce((acc, w) => acc + w.objectifsDone.filter(Boolean).length, 0);
        const phaseTotal = phaseWeeks.reduce((acc, w) => acc + w.objectifs.length, 0);
        const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
        const meta = PHASE_LABELS[phase];

        return (
          <div key={phase} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: meta.color }} />
                <h2 className="text-base font-semibold" style={{ color: meta.color }}>{meta.label}</h2>
                <span className="text-sm text-slate-500">— {meta.desc}</span>
              </div>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">{phasePct}%</span>
            </div>
            <div className="space-y-2">
              {phaseWeeks.map((week) => (
                <WeekCard key={week.semaine} week={week} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
