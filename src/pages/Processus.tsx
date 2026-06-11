import { useState } from 'react';
import { Trash2, Download, Pencil, GitBranch, ClipboardList, ChevronRight } from 'lucide-react';
import type { Processus, PrioriteType } from '../types';
import { useStore } from '../lib/useStore';
import { saveProcessus, deleteProcessus } from '../lib/store';
import { uid, exportCsv } from '../lib/utils';
import { Button, Input, Textarea, Select, Card, Badge, EmptyState } from '../components/ui';
import ProcessusWorkflow from './ProcessusWorkflow';

const PRIORITE_OPTIONS: { value: PrioriteType; label: string; badge: 'p1' | 'p2' | 'p3' }[] = [
  { value: 'P1', label: '🔴 P1 — Critique', badge: 'p1' },
  { value: 'P2', label: '🟡 P2 — Important', badge: 'p2' },
  { value: 'P3', label: '🟢 P3 — Nice to have', badge: 'p3' },
];

const ACTEURS = [
  'Gestionnaire de prestations', 'Actuaire / Tarificateur', 'Souscripteur',
  'Responsable fraude', 'Commercial / Sales', 'DSI / IT', 'Direction',
];

function emptyQuestionnaire(): Processus {
  return {
    id: uid(), mode: 'questionnaire', nom: '', acteurPrincipal: '',
    frequence: '', tempsMoyen: '', reglesExplicites: '', reglesTacites: '',
    painPoints: '', potentielAgent: '', priorite: 'P2',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

function emptyWorkflow(nom: string): Processus {
  return {
    id: uid(), mode: 'workflow', nom, acteurPrincipal: '',
    frequence: '', tempsMoyen: '', reglesExplicites: '', reglesTacites: '',
    painPoints: '', potentielAgent: '', priorite: 'P2',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

function WorkflowMiniStats({ data }: { data: string }) {
  try {
    const parsed = JSON.parse(data);
    const nodes: { type: string }[] = parsed.nodes ?? [];
    const edges: unknown[] = parsed.edges ?? [];
    const c = nodes.reduce<Record<string, number>>((acc, n) => { acc[n.type] = (acc[n.type] || 0) + 1; return acc; }, {});
    return (
      <div className="flex items-center gap-2 flex-wrap mt-2">
        {c.start    && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">● {c.start} début</span>}
        {c.process  && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">■ {c.process} étape{c.process > 1 ? 's' : ''}</span>}
        {c.decision && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">◆ {c.decision} décision{c.decision > 1 ? 's' : ''}</span>}
        {c.end      && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">● {c.end} fin</span>}
        {c.annotation && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-600">▭ {c.annotation} note{c.annotation > 1 ? 's' : ''}</span>}
        <span className="text-xs text-slate-400">{edges.length} connexion{edges.length > 1 ? 's' : ''}</span>
      </div>
    );
  } catch { return null; }
}

function prioBadgeVariant(pr: PrioriteType): 'p1' | 'p2' | 'p3' {
  return PRIORITE_OPTIONS.find((o) => o.value === pr)?.badge ?? 'p3';
}

export default function ProcessusPage() {
  const store = useStore();

  const questionnaires = store.processus.filter((p) =>
    (p.mode ?? (p.workflowData ? 'workflow' : 'questionnaire')) === 'questionnaire'
  );
  const workflows = store.processus.filter((p) =>
    (p.mode ?? (p.workflowData ? 'workflow' : 'questionnaire')) === 'workflow'
  );

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Processus>(emptyQuestionnaire());
  const [filterPriorite, setFilterPriorite] = useState<PrioriteType | 'all'>('all');
  const [filterActeur, setFilterActeur] = useState('');
  const [workflowTarget, setWorkflowTarget] = useState<Processus | null>(null);
  const [showWorkflowNew, setShowWorkflowNew] = useState(false);
  const [workflowNewName, setWorkflowNewName] = useState('');

  const handleOpenForm = (p?: Processus) => { setForm(p ? { ...p } : emptyQuestionnaire()); setShowForm(true); };
  const handleSaveForm = () => { saveProcessus({ ...form, updatedAt: new Date().toISOString() }); setShowForm(false); };
  const handleDelete = (id: string) => { if (confirm('Supprimer ce processus ?')) deleteProcessus(id); };

  const handleExport = () => {
    const headers = ['Mode', 'Nom', 'Acteur', 'Fréquence', 'Temps moyen', 'Règles explicites', 'Règles tacites', 'Pain points', 'Potentiel agent IA', 'Priorité'];
    exportCsv('cartographie_processus.csv', store.processus.map((p) => [p.mode ?? 'questionnaire', p.nom, p.acteurPrincipal, p.frequence, p.tempsMoyen, p.reglesExplicites, p.reglesTacites, p.painPoints, p.potentielAgent, p.priorite]), headers);
  };

  const handleCreateWorkflow = () => {
    if (!workflowNewName.trim()) return;
    const newP = emptyWorkflow(workflowNewName.trim());
    saveProcessus(newP);
    setShowWorkflowNew(false);
    setWorkflowNewName('');
    setWorkflowTarget(newP);
  };

  const handleWorkflowSave = (data: string) => {
    if (!workflowTarget) return;
    saveProcessus({ ...workflowTarget, workflowData: data, updatedAt: new Date().toISOString() });
    setWorkflowTarget(null);
  };

  const setField = <K extends keyof Processus>(k: K, v: Processus[K]) => setForm((f) => ({ ...f, [k]: v }));

  const filteredQ = questionnaires.filter((p) => {
    if (filterPriorite !== 'all' && p.priorite !== filterPriorite) return false;
    if (filterActeur && !p.acteurPrincipal.toLowerCase().includes(filterActeur.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {workflowTarget && (
        <ProcessusWorkflow
          processusNom={workflowTarget.nom}
          initialData={workflowTarget.workflowData}
          onSave={handleWorkflowSave}
          onClose={() => setWorkflowTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-1">Cartographie des processus</h2>
          <p className="text-slate-500 text-sm">
            {questionnaires.length} questionnaire{questionnaires.length !== 1 ? 's' : ''} · {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </p>
        </div>
        {store.processus.length > 0 && (
          <Button variant="ghost" onClick={handleExport}><Download size={15} /> CSV</Button>
        )}
      </div>

      {/* ── Deux points d'entrée ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => handleOpenForm()}
          className="group text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-[#00b894]/40 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
              <ClipboardList size={20} className="text-[#00b894]" />
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-[#00b894] transition-colors mt-1" />
          </div>
          <h3 className="text-slate-800 font-semibold mb-1">📋 Nouveau questionnaire</h3>
          <p className="text-slate-400 text-xs leading-relaxed">Règles explicites, règles tacites, pain points, potentiel IA</p>
        </button>

        <button
          onClick={() => setShowWorkflowNew(true)}
          className="group text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
              <GitBranch size={20} className="text-blue-500" />
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors mt-1" />
          </div>
          <h3 className="text-slate-800 font-semibold mb-1">🔀 Nouveau workflow visuel</h3>
          <p className="text-slate-400 text-xs leading-relaxed">Diagramme drag & drop — Début, Étapes, Décisions, Fin</p>
        </button>
      </div>

      {/* ── Section Workflows visuels ─────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch size={15} className="text-blue-500" />
          <h3 className="text-slate-700 font-semibold text-sm">Workflows visuels</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{workflows.length}</span>
        </div>

        {workflows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-white">
            <p className="text-slate-400 text-sm">Aucun workflow visuel — clique sur "Nouveau workflow visuel" ci-dessus</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workflows.map((p) => (
              <button
                key={p.id}
                onClick={() => setWorkflowTarget(p)}
                className="group text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all relative"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>

                <div className="flex items-center gap-2 mb-2 pr-6">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-600">🔀 Workflow</span>
                  <Badge variant={prioBadgeVariant(p.priorite)}>{p.priorite}</Badge>
                </div>

                <p className="text-slate-800 font-semibold text-sm mb-0.5 truncate">{p.nom}</p>
                {p.acteurPrincipal && <p className="text-slate-400 text-xs mb-1">{p.acteurPrincipal}</p>}

                {p.workflowData
                  ? <WorkflowMiniStats data={p.workflowData} />
                  : <p className="text-xs text-slate-400 italic mt-1">Workflow vide — cliquer pour dessiner</p>
                }

                <p className="text-slate-400 text-xs mt-3 pt-2 border-t border-slate-100 group-hover:text-blue-500 transition-colors">
                  Ouvrir le designer →
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Section Questionnaires ────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList size={15} className="text-[#00b894]" />
          <h3 className="text-slate-700 font-semibold text-sm">Questionnaires</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{questionnaires.length}</span>
          {questionnaires.length > 0 && (
            <div className="flex gap-2 ml-auto">
              <Select className="w-auto text-xs" value={filterPriorite} onChange={(e) => setFilterPriorite(e.target.value as PrioriteType | 'all')}>
                <option value="all">Toutes priorités</option>
                {PRIORITE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
              <Input className="w-36 text-xs" placeholder="Filtrer acteur..." value={filterActeur} onChange={(e) => setFilterActeur(e.target.value)} />
            </div>
          )}
        </div>

        {questionnaires.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-white">
            <p className="text-slate-400 text-sm">Aucun questionnaire — clique sur "Nouveau questionnaire" ci-dessus</p>
          </div>
        ) : filteredQ.length === 0 ? (
          <EmptyState icon="🔍" title="Aucun résultat" description="Modifie les filtres" />
        ) : (
          <div className="space-y-3">
            {filteredQ.map((p) => (
              <Card key={p.id} className="group hover:shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-slate-800 font-semibold">{p.nom}</span>
                      <Badge variant={prioBadgeVariant(p.priorite)}>{p.priorite}</Badge>
                      {p.acteurPrincipal && (
                        <span className="text-xs text-slate-500 px-2 py-0.5 rounded bg-slate-100">{p.acteurPrincipal}</span>
                      )}
                    </div>
                    <div className="flex gap-4 mb-3">
                      {p.frequence && <div className="text-xs"><span className="text-slate-400">Fréquence: </span><span className="text-slate-700">{p.frequence}</span></div>}
                      {p.tempsMoyen && <div className="text-xs"><span className="text-slate-400">Temps: </span><span className="text-slate-700">{p.tempsMoyen}</span></div>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {p.reglesTacites && (
                        <div className="p-2 rounded-lg border border-green-200 bg-green-50">
                          <p className="text-xs text-[#00966e] font-medium mb-1">⭐ Règles tacites</p>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-3">{p.reglesTacites}</p>
                        </div>
                      )}
                      {p.potentielAgent && (
                        <div className="p-2 rounded-lg border border-purple-200 bg-purple-50">
                          <p className="text-xs text-purple-600 font-medium mb-1">🤖 Potentiel agent IA</p>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-3">{p.potentielAgent}</p>
                        </div>
                      )}
                      {p.painPoints && (
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Pain points</p>
                          <p className="text-xs text-slate-600 whitespace-pre-wrap line-clamp-2">{p.painPoints}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => handleOpenForm(p)} title="Modifier" className="p-1.5 rounded-lg text-slate-400 hover:text-[#00b894] hover:bg-green-50 transition-all">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} title="Supprimer" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal questionnaire ───────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4 bg-black/30">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-slate-800 font-semibold text-lg mb-4">
              {form.id && questionnaires.find(q => q.id === form.id) ? 'Modifier le questionnaire' : 'Nouveau questionnaire'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Nom du processus *</label>
                <Input placeholder="Ex: Remboursement pharmacie classique" value={form.nom} onChange={(e) => setField('nom', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Acteur principal</label>
                <Select value={form.acteurPrincipal} onChange={(e) => setField('acteurPrincipal', e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {ACTEURS.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Priorité</label>
                <Select value={form.priorite} onChange={(e) => setField('priorite', e.target.value as PrioriteType)}>
                  {PRIORITE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Fréquence</label>
                <Input placeholder="Ex: 50 dossiers/jour" value={form.frequence} onChange={(e) => setField('frequence', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Temps moyen</label>
                <Input placeholder="Ex: 15 min par dossier" value={form.tempsMoyen} onChange={(e) => setField('tempsMoyen', e.target.value)} />
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Règles explicites</label>
                <Textarea rows={2} placeholder="Ce qui est écrit dans les procédures..." value={form.reglesExplicites} onChange={(e) => setField('reglesExplicites', e.target.value)} />
              </div>
              <div>
                <label className="text-xs mb-1 flex items-center gap-2">
                  <span className="text-[#00b894] font-semibold">⭐ Règles tacites</span>
                  <span className="text-slate-400">(ce que personne n'écrit mais tout le monde fait)</span>
                </label>
                <Textarea rows={3} placeholder="Heuristiques, raccourcis, exceptions non documentées..." value={form.reglesTacites} onChange={(e) => setField('reglesTacites', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Pain points</label>
                <Textarea rows={2} placeholder="Frictions, blocages, pertes de temps..." value={form.painPoints} onChange={(e) => setField('painPoints', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Potentiel agent IA</label>
                <Textarea rows={2} placeholder="Ce qu'un agent IA pourrait automatiser..." value={form.potentielAgent} onChange={(e) => setField('potentielAgent', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button variant="primary" onClick={handleSaveForm} disabled={!form.nom.trim()}>Sauvegarder</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal nom workflow ────────────────────────────────────── */}
      {showWorkflowNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
                <GitBranch size={18} className="text-blue-500" />
              </div>
              <h3 className="text-slate-800 font-semibold text-lg">Nouveau workflow visuel</h3>
            </div>
            <p className="text-slate-500 text-sm mb-4">Donne un nom au processus que tu vas cartographier.</p>
            <label className="block text-xs text-slate-500 mb-2">Nom du processus *</label>
            <Input
              autoFocus
              placeholder="Ex: Pré-autorisation hospitalisation"
              value={workflowNewName}
              onChange={(e) => setWorkflowNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateWorkflow(); }}
            />
            <div className="flex gap-3 justify-end mt-5">
              <Button variant="secondary" onClick={() => { setShowWorkflowNew(false); setWorkflowNewName(''); }}>Annuler</Button>
              <Button variant="primary" onClick={handleCreateWorkflow} disabled={!workflowNewName.trim()}>
                <GitBranch size={15} /> Ouvrir le designer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
