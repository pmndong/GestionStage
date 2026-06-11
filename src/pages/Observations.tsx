import { useState } from 'react';
import { Plus, Trash2, Download, ChevronDown, ChevronUp, Star } from 'lucide-react';
import type { ObservationSession, ModuleConcerne } from '../types';
import { useStore } from '../lib/useStore';
import { saveObservation, deleteObservation } from '../lib/store';
import { uid, formatDate, exportCsv } from '../lib/utils';
import { Button, Input, Textarea, Select, Card, EmptyState } from '../components/ui';

const MODULE_OPTIONS: { value: ModuleConcerne; label: string }[] = [
  { value: 'fraude', label: '🛡️ Détection de fraude' },
  { value: 'dashboard', label: '📊 Dashboard KPI' },
  { value: 'indemnisation', label: '⚖️ Analyse indemnisation' },
  { value: 'general', label: '🔧 Général' },
];

const PROFILE_OPTIONS = [
  'Gestionnaire de prestations', 'Actuaire / Tarificateur', 'Souscripteur',
  'Responsable fraude', 'Commercial / Sales', 'DSI / IT', 'Direction / Décideurs',
];

function emptyObs(): ObservationSession {
  return {
    id: uid(), date: new Date().toISOString().split('T')[0], profileObserve: '',
    duree: '', entreprise: '', tacheObservee: '', etapesReelles: '', outilsUtilises: '',
    ecartsProcessOfficiel: '', frustrations: '', opportuniteAutomatisation: '',
    scoreImpact: 3, scoreFaisabilite: 3,
    tempsReel: undefined, nbPersonnes: undefined, frequenceParSemaine: undefined, moduleConcerne: undefined,
    createdAt: new Date().toISOString(),
  };
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${n <= value ? 'bg-[#00b894] text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Observations() {
  const store = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ObservationSession>(emptyObs());
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleOpen = (obs?: ObservationSession) => {
    setForm(obs ? obs : emptyObs());
    setEditingId(obs ? obs.id : null);
    setShowForm(true);
  };

  const handleSave = () => { saveObservation(form); setShowForm(false); };
  const handleDelete = (id: string) => { if (confirm('Supprimer cette session ?')) deleteObservation(id); };
  const handleExportCsv = () => {
    const headers = ['Date', 'Profil', 'Entreprise', 'Durée', 'Tâche', 'Étapes', 'Outils', 'Écarts', 'Frustrations', 'Opportunité', 'Impact', 'Faisabilité', 'Score'];
    const rows = store.observations.map((o) => [o.date, o.profileObserve, o.entreprise, o.duree, o.tacheObservee, o.etapesReelles, o.outilsUtilises, o.ecartsProcessOfficiel, o.frustrations, o.opportuniteAutomatisation, String(o.scoreImpact), String(o.scoreFaisabilite), String(o.scoreImpact * o.scoreFaisabilite)]);
    exportCsv('observations_terrain.csv', rows, headers);
  };

  const sorted = [...store.observations].sort((a, b) =>
    sortBy === 'score' ? (b.scoreImpact * b.scoreFaisabilite) - (a.scoreImpact * a.scoreFaisabilite) : b.date.localeCompare(a.date)
  );

  const setField = <K extends keyof ObservationSession>(k: K, v: ObservationSession[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-1">Observations terrain</h2>
          <p className="text-slate-500 text-sm">{store.observations.length} session{store.observations.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {store.observations.length > 0 && <Button variant="ghost" onClick={handleExportCsv}><Download size={15} /> CSV</Button>}
          <Button variant="primary" onClick={() => handleOpen()}><Plus size={16} /> Nouvelle session</Button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4 bg-black/30">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-slate-800 font-semibold text-lg mb-4">{editingId ? 'Modifier la session' : "Nouvelle session d'observation"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div><label className="block text-xs text-slate-500 mb-1">Date</label><Input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} /></div>
              <div><label className="block text-xs text-slate-500 mb-1">Durée</label><Input placeholder="Ex: 2h30" value={form.duree} onChange={(e) => setField('duree', e.target.value)} /></div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Profil observé</label>
                <Select value={form.profileObserve} onChange={(e) => setField('profileObserve', e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {PROFILE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
              <div><label className="block text-xs text-slate-500 mb-1">Entreprise</label><Input placeholder="AXA Assurance Sénégal" value={form.entreprise} onChange={(e) => setField('entreprise', e.target.value)} /></div>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { key: 'tacheObservee', label: 'Tâche observée' },
                { key: 'etapesReelles', label: 'Étapes réelles observées' },
                { key: 'outilsUtilises', label: 'Outils utilisés' },
                { key: 'ecartsProcessOfficiel', label: 'Écarts vs process officiel' },
                { key: 'frustrations', label: 'Frustrations observées/exprimées' },
                { key: 'opportuniteAutomatisation', label: "Opportunité d'automatisation identifiée" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-500 mb-1">{label}</label>
                  <Textarea rows={2} placeholder={label} value={String(form[key as keyof ObservationSession])} onChange={(e) => setField(key as keyof ObservationSession, e.target.value as never)} />
                </div>
              ))}
            </div>
            {/* Métriques quantitatives */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-4">
              <p className="text-xs font-semibold text-emerald-700 mb-3">📊 Métriques quantitatives observées</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Temps réel (min)</label>
                  <Input type="number" placeholder="Ex: 45" value={form.tempsReel ?? ''} onChange={(e) => setField('tempsReel', e.target.value ? parseInt(e.target.value) : undefined)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nb personnes impliquées</label>
                  <Input type="number" placeholder="Ex: 3" value={form.nbPersonnes ?? ''} onChange={(e) => setField('nbPersonnes', e.target.value ? parseInt(e.target.value) : undefined)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Fréquence / semaine</label>
                  <Input type="number" placeholder="Ex: 10" value={form.frequenceParSemaine ?? ''} onChange={(e) => setField('frequenceParSemaine', e.target.value ? parseInt(e.target.value) : undefined)} />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">Module concerné</label>
                <Select value={form.moduleConcerne ?? ''} onChange={(e) => setField('moduleConcerne', (e.target.value || undefined) as ModuleConcerne | undefined)}>
                  <option value="">Non spécifié</option>
                  {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
              {form.tempsReel && form.frequenceParSemaine && (
                <div className="mt-3 p-2 rounded bg-emerald-100 text-xs text-emerald-700">
                  ⏱️ Estimation : <strong>{Math.round(form.tempsReel * form.frequenceParSemaine * 52 / 60)}h/an</strong> consacrées à cette tâche
                  {form.nbPersonnes && form.nbPersonnes > 1 ? ` × ${form.nbPersonnes} personnes = ` : ''}
                  {form.nbPersonnes && form.nbPersonnes > 1 ? <strong>{Math.round(form.tempsReel * form.frequenceParSemaine * 52 * form.nbPersonnes / 60)}h/an au total</strong> : ''}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <ScoreInput label="Impact (1-5)" value={form.scoreImpact} onChange={(v) => setField('scoreImpact', v)} />
              <ScoreInput label="Faisabilité (1-5)" value={form.scoreFaisabilite} onChange={(v) => setField('scoreFaisabilite', v)} />
            </div>
            <div className="mb-6 p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-sm text-slate-500">Score total (impact × faisabilité)</span>
              <span className="text-xl font-bold text-[#00b894]">{form.scoreImpact * form.scoreFaisabilite}/25</span>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button variant="primary" onClick={handleSave}>Sauvegarder</Button>
            </div>
          </div>
        </div>
      )}

      {/* Sort */}
      {store.observations.length > 0 && (
        <div className="flex gap-2 mb-4">
          {(['date', 'score'] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${sortBy === s ? 'bg-[#00b894]/10 text-[#00966e] border-[#00b894]/20' : 'text-slate-500 hover:text-slate-700 border-slate-200 bg-white'}`}>
              Par {s === 'date' ? 'date' : 'score'}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {store.observations.length === 0 ? (
        <EmptyState icon="👁️" title="Aucune session d'observation" description="Enregistre tes shadow sessions pour capturer les processus réels" />
      ) : (
        <div className="space-y-3">
          {sorted.map((obs) => {
            const scoreTotal = obs.scoreImpact * obs.scoreFaisabilite;
            const isExpanded = expandedId === obs.id;
            const scoreColor = scoreTotal >= 16 ? '#00b894' : scoreTotal >= 9 ? '#f59e0b' : '#ef4444';
            return (
              <Card key={obs.id} className="group hover:shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-start gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : obs.id)}>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{ background: `${scoreColor}18`, color: scoreColor }}>{scoreTotal}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">/25</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-800 font-medium text-sm">{obs.tacheObservee || 'Sans titre'}</span>
                    <p className="text-slate-400 text-xs mt-0.5">{obs.profileObserve} • {obs.entreprise} • {formatDate(obs.date)}{obs.duree ? ` • ${obs.duree}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleOpen(obs); }} className="text-xs text-slate-400 hover:text-[#00b894] px-2 py-1 rounded hover:bg-green-50 transition-all">Modifier</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(obs.id); }} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Étapes réelles', value: obs.etapesReelles },
                      { label: 'Outils utilisés', value: obs.outilsUtilises },
                      { label: 'Écarts vs process officiel', value: obs.ecartsProcessOfficiel },
                      { label: 'Frustrations', value: obs.frustrations },
                      { label: "Opportunité d'automatisation", value: obs.opportuniteAutomatisation },
                    ].filter(x => x.value).map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{value}</p>
                      </div>
                    ))}
                    <div className="flex gap-6">
                      <div><p className="text-xs text-slate-400 mb-1">Impact</p><div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= obs.scoreImpact ? 'text-[#00b894] fill-[#00b894]' : 'text-slate-200'} />)}</div></div>
                      <div><p className="text-xs text-slate-400 mb-1">Faisabilité</p><div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= obs.scoreFaisabilite ? 'text-[#00b894] fill-[#00b894]' : 'text-slate-200'} />)}</div></div>
                    </div>
                    {(obs.tempsReel || obs.nbPersonnes || obs.frequenceParSemaine) && (
                      <div className="sm:col-span-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                        <p className="text-xs font-semibold text-emerald-700 mb-2">📊 Métriques quantitatives</p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                          {obs.tempsReel && <span>⏱️ <strong>{obs.tempsReel} min</strong> / tâche</span>}
                          {obs.nbPersonnes && <span>👥 <strong>{obs.nbPersonnes}</strong> personne{obs.nbPersonnes > 1 ? 's' : ''}</span>}
                          {obs.frequenceParSemaine && <span>🔁 <strong>{obs.frequenceParSemaine}×</strong> / semaine</span>}
                          {obs.tempsReel && obs.frequenceParSemaine && (
                            <span className="text-emerald-700 font-semibold">
                              → {Math.round(obs.tempsReel * obs.frequenceParSemaine * 52 * (obs.nbPersonnes || 1) / 60)}h/an
                            </span>
                          )}
                          {obs.moduleConcerne && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{MODULE_OPTIONS.find(m => m.value === obs.moduleConcerne)?.label}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
