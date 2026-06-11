import { useStore } from '../lib/useStore';
import type { Metrique, ModuleConcerne } from '../types';

const MODULE_META: Record<ModuleConcerne, { label: string; emoji: string; color: string; bg: string; desc: string }> = {
  fraude:        { label: 'Détection de fraude',    emoji: '🛡️', color: '#ef4444', bg: '#fef2f2', desc: 'Réduction des pertes par fraude détectée automatiquement' },
  dashboard:     { label: 'Dashboard KPI',          emoji: '📊', color: '#3b82f6', bg: '#eff6ff', desc: 'Gain de temps sur le pilotage et la production de rapports' },
  indemnisation: { label: 'Analyse indemnisation',  emoji: '⚖️', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Accélération du traitement des dossiers de sinistres' },
  general:       { label: 'Général',                emoji: '🔧', color: '#64748b', bg: '#f8fafc', desc: 'Métriques transversales' },
};

// Coût horaire moyen d'un collaborateur assurance au Sénégal (hypothèse conservative)
const COUT_HORAIRE_FCFA = 5000;
// Taux de réduction estimé si module implémenté (conservative)
const TAUX_REDUCTION = 0.6;

function calcAnnuelHeures(m: Metrique): number {
  if (m.unite !== 'minutes' && m.unite !== 'heures') return 0;
  const valeurEnHeures = m.unite === 'minutes' ? m.valeur / 60 : m.valeur;
  const multiplicateur: Record<string, number> = {
    'par dossier': 0, // need frequency
    'par jour': 220,
    'par semaine': 52,
    'par mois': 12,
    'par an': 1,
  };
  return valeurEnHeures * (multiplicateur[m.frequence] || 0);
}

function calcAnnuelFCFA(m: Metrique): number {
  if (m.unite === 'FCFA') {
    const multiplicateur: Record<string, number> = {
      'par dossier': 0,
      'par jour': 220,
      'par semaine': 52,
      'par mois': 12,
      'par an': 1,
    };
    return m.valeur * (multiplicateur[m.frequence] || 0);
  }
  return calcAnnuelHeures(m) * COUT_HORAIRE_FCFA;
}

function formatFCFA(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K FCFA`;
  return `${v.toFixed(0)} FCFA`;
}

function formatHeures(h: number): string {
  if (h === 0) return '—';
  if (h >= 1000) return `${(h / 1000).toFixed(1)}K h/an`;
  return `${Math.round(h)} h/an`;
}

function ModuleCard({ module, metriques }: { module: ModuleConcerne; metriques: Metrique[] }) {
  const meta = MODULE_META[module];
  const totalHeures = metriques.reduce((acc, m) => acc + calcAnnuelHeures(m), 0);
  const totalFCFA = metriques.reduce((acc, m) => acc + calcAnnuelFCFA(m), 0);
  const gainFCFA = totalFCFA * TAUX_REDUCTION;
  const gainHeures = totalHeures * TAUX_REDUCTION;

  if (metriques.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 flex items-center gap-3">
        <span className="text-2xl">{meta.emoji}</span>
        <div>
          <p className="text-slate-600 font-medium text-sm">{meta.label}</p>
          <p className="text-slate-400 text-xs">Aucune métrique capturée — à remplir pendant les interviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: `${meta.color}30` }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ background: meta.bg, borderColor: `${meta.color}20` }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-semibold text-slate-800">{meta.label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto" style={{ background: `${meta.color}20`, color: meta.color }}>
            {metriques.length} métrique{metriques.length > 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-slate-500">{meta.desc}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-slate-100">
        <div className="p-4 text-center">
          <p className="text-lg font-bold text-slate-800">{formatHeures(totalHeures)}</p>
          <p className="text-xs text-slate-400">Temps perdu/an</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-lg font-bold" style={{ color: meta.color }}>{formatHeures(gainHeures)}</p>
          <p className="text-xs text-slate-400">Temps récupéré (-60%)</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-lg font-bold text-slate-800">{formatFCFA(totalFCFA)}</p>
          <p className="text-xs text-slate-400">Coût annuel estimé</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-lg font-bold text-green-600">{formatFCFA(gainFCFA)}</p>
          <p className="text-xs text-slate-400">Économie potentielle</p>
        </div>
      </div>

      {/* Métriques détail */}
      <div className="p-4 border-t border-slate-50">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Détail des métriques</p>
        <div className="space-y-2">
          {metriques.map((m) => {
            const h = calcAnnuelHeures(m);
            const fcfa = calcAnnuelFCFA(m);
            return (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 truncate">{m.label || 'Sans label'}</p>
                  {m.notes && <p className="text-slate-400 text-xs truncate">{m.notes}</p>}
                </div>
                <div className="flex gap-4 text-xs text-slate-500 flex-shrink-0">
                  <span className="font-mono font-semibold text-slate-700">{m.valeur} {m.unite}</span>
                  <span>{m.frequence}</span>
                  {h > 0 && <span className="text-blue-600">{formatHeures(h)}</span>}
                  {fcfa > 0 && <span className="text-green-600 font-semibold">{formatFCFA(fcfa * TAUX_REDUCTION)} éco.</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SourceTag({ label, count }: { label: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
      {label} <strong>{count}</strong>
    </span>
  );
}

export default function Impact() {
  const store = useStore();

  // Collect all metriques from interviews + standalone store
  const allMetriques: Metrique[] = [
    ...store.metriques,
    ...store.interviews.flatMap((iv) => iv.metriques || []),
  ];

  // Also derive from observations
  const obsMetriques: Metrique[] = store.observations
    .filter((o) => o.tempsReel && o.frequenceParSemaine)
    .map((o) => ({
      id: `obs_${o.id}`,
      label: o.tacheObservee || 'Tâche observée',
      valeur: o.tempsReel!,
      unite: 'minutes' as const,
      frequence: 'par semaine' as const,
      module: o.moduleConcerne || 'general',
      sourceObservationId: o.id,
      notes: o.entreprise,
      createdAt: o.createdAt,
    }));

  const combined = [...allMetriques, ...obsMetriques];

  const byModule = (module: ModuleConcerne) => combined.filter((m) => m.module === module);

  const totalGainFCFA = combined.reduce((acc, m) => acc + calcAnnuelFCFA(m) * TAUX_REDUCTION, 0);
  const totalHeures = combined.reduce((acc, m) => acc + calcAnnuelHeures(m), 0);
  const totalGainHeures = totalHeures * TAUX_REDUCTION;

  const interviewsAvecMetriques = store.interviews.filter((iv) => iv.metriques && iv.metriques.length > 0).length;
  const obsAvecMetriques = store.observations.filter((o) => o.tempsReel).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Impact Commercial</h1>
        <p className="text-slate-500 text-sm">Synthèse chiffrée pour les fiches commerciales Allianz & NSIA</p>
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-2 mb-6">
        <SourceTag label="📋 Interviews avec métriques" count={interviewsAvecMetriques} />
        <SourceTag label="👁️ Observations quantifiées" count={obsAvecMetriques} />
        <SourceTag label="📐 Métriques totales" count={combined.length} />
      </div>

      {combined.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-slate-600 font-medium mb-1">Aucune métrique capturée</p>
          <p className="text-slate-400 text-sm">Ajoute des métriques dans tes interviews ou observations terrain pour générer la synthèse d'impact commercial.</p>
        </div>
      ) : (
        <>
          {/* KPIs globaux */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-3xl font-bold text-slate-800">{formatHeures(totalHeures)}</p>
              <p className="text-sm text-slate-500 mt-1">Temps perdu/an (actuel)</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="text-3xl font-bold text-emerald-600">{formatHeures(totalGainHeures)}</p>
              <p className="text-sm text-slate-500 mt-1">Heures récupérées/an (-60%)</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="text-3xl font-bold text-emerald-600">{formatFCFA(totalGainFCFA)}</p>
              <p className="text-sm text-slate-500 mt-1">Économie annuelle estimée</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-6 text-xs text-amber-700">
            <strong>Hypothèses :</strong> Coût horaire collaborateur = {formatFCFA(COUT_HORAIRE_FCFA)}/h · Taux de réduction estimé avec les modules = 60% · Basé sur {combined.length} métrique{combined.length > 1 ? 's' : ''} capturée{combined.length > 1 ? 's' : ''}.
            Ces chiffres sont des estimations conservatrices à affiner avec les données terrain.
          </div>

          {/* Par module */}
          <div className="space-y-4">
            {(['fraude', 'dashboard', 'indemnisation', 'general'] as ModuleConcerne[]).map((mod) => (
              <ModuleCard key={mod} module={mod} metriques={byModule(mod)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
