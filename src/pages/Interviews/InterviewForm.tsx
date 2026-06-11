import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, Save, Download, Plus, Trash2, TrendingUp } from 'lucide-react';
import { PROFILE_META, getQuestionsForProfile } from '../../data/questions';
import type { ProfileType, Interview, QuestionAnswer, Metrique, ModuleConcerne, UniteMetrique, FrequenceMetrique } from '../../types';
import { useStore } from '../../lib/useStore';
import { saveInterview } from '../../lib/store';
import { uid, formatDate, exportTxt } from '../../lib/utils';
import { Button, Input, Textarea, Badge, Card, Select } from '../../components/ui';

const MODULE_OPTIONS: { value: ModuleConcerne; label: string }[] = [
  { value: 'fraude', label: '🛡️ Détection de fraude' },
  { value: 'dashboard', label: '📊 Dashboard KPI' },
  { value: 'indemnisation', label: '⚖️ Analyse indemnisation' },
  { value: 'general', label: '🔧 Général' },
];

const UNITE_OPTIONS: UniteMetrique[] = ['minutes', 'heures', 'jours', 'FCFA', '%', 'dossiers', 'personnes', 'autre'];
const FREQUENCE_OPTIONS: FrequenceMetrique[] = ['par dossier', 'par jour', 'par semaine', 'par mois', 'par an'];

function emptyMetrique(interviewId: string): Metrique {
  return {
    id: uid(), label: '', valeur: 0, unite: 'minutes', frequence: 'par jour',
    module: 'general', sourceInterviewId: interviewId, notes: '',
    createdAt: new Date().toISOString(),
  };
}

function MetriqueRow({ m, onChange, onDelete }: { m: Metrique; onChange: (m: Metrique) => void; onDelete: () => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Label ex: Temps de traitement d'un dossier fraude"
          value={m.label}
          onChange={(e) => onChange({ ...m, label: e.target.value })}
          className="flex-1"
        />
        <button onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Valeur</label>
          <Input
            type="number"
            placeholder="45"
            value={m.valeur || ''}
            onChange={(e) => onChange({ ...m, valeur: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Unité</label>
          <Select value={m.unite} onChange={(e) => onChange({ ...m, unite: e.target.value as UniteMetrique })}>
            {UNITE_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Fréquence</label>
          <Select value={m.frequence} onChange={(e) => onChange({ ...m, frequence: e.target.value as FrequenceMetrique })}>
            {FREQUENCE_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Module concerné</label>
          <Select value={m.module} onChange={(e) => onChange({ ...m, module: e.target.value as ModuleConcerne })}>
            {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
      </div>
      <Input
        placeholder="Notes (contexte, source, conditions...)"
        value={m.notes}
        onChange={(e) => onChange({ ...m, notes: e.target.value })}
      />
    </div>
  );
}

export default function InterviewForm() {
  const { profile, id } = useParams<{ profile: string; id: string }>();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('new') === '1';
  const navigate = useNavigate();
  const store = useStore();
  const profileType = profile as ProfileType;
  const meta = PROFILE_META[profileType];
  const questions = getQuestionsForProfile(profileType);
  const existing = store.interviews.find((i) => i.id === id);

  const [form, setForm] = useState<Omit<Interview, 'answers' | 'metriques' | 'createdAt' | 'updatedAt'>>({
    id: id || uid(), profileType,
    intervieweeName: '', poste: '', anciennete: '', entreprise: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [metriques, setMetriques] = useState<Metrique[]>([]);
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({ common: true, specific: true, metriques: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({ id: existing.id, profileType: existing.profileType, intervieweeName: existing.intervieweeName, poste: existing.poste, anciennete: existing.anciennete, entreprise: existing.entreprise, date: existing.date });
      const ans: Record<string, string> = {};
      existing.answers.forEach((a) => { ans[a.questionId] = a.answer; });
      setAnswers(ans);
      setMetriques(existing.metriques || []);
    }
  }, [existing?.id]);

  const doSave = useCallback(() => {
    const answersArray: QuestionAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    const now = new Date().toISOString();
    saveInterview({ ...form, answers: answersArray, metriques, createdAt: existing?.createdAt || now, updatedAt: now });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [form, answers, metriques, existing]);

  useEffect(() => {
    if (!isNew && existing) {
      const timer = setTimeout(doSave, 800);
      return () => clearTimeout(timer);
    }
  }, [answers]);

  const handleAnswer = (qId: string, value: string) => setAnswers((prev) => ({ ...prev, [qId]: value }));

  const handleAddMetrique = () => {
    setMetriques((prev) => [...prev, emptyMetrique(form.id)]);
    setOpenBlocks((b) => ({ ...b, metriques: true }));
  };

  const handleUpdateMetrique = (updated: Metrique) => {
    setMetriques((prev) => prev.map((m) => m.id === updated.id ? updated : m));
  };

  const handleDeleteMetrique = (mId: string) => {
    setMetriques((prev) => prev.filter((m) => m.id !== mId));
  };

  const handleExport = () => {
    const lines = [`# Interview — ${meta.emoji} ${meta.label}`, ``, `**Interviewé :** ${form.intervieweeName}`, `**Poste :** ${form.poste}`, `**Entreprise :** ${form.entreprise}`, `**Ancienneté :** ${form.anciennete}`, `**Date :** ${formatDate(form.date)}`, ``, `---`, ``];
    for (const q of questions) {
      lines.push(`### [${q.type === 'common' ? 'Tronc commun' : 'Spécifique'}] ${q.text}`, ``, answers[q.id] || '_Sans réponse_', ``);
    }
    if (metriques.length > 0) {
      lines.push(`---`, `## Métriques capturées`, ``);
      metriques.forEach((m) => {
        lines.push(`- **${m.label}** : ${m.valeur} ${m.unite} ${m.frequence} [${m.module}]${m.notes ? ` — ${m.notes}` : ''}`);
      });
    }
    exportTxt(`interview_${form.intervieweeName || 'sans-nom'}_${form.date}.md`, lines.join('\n'));
  };

  if (!meta) { navigate('/interviews'); return null; }

  const commonQs = questions.filter((q) => q.type === 'common');
  const specificQs = questions.filter((q) => q.type === 'specific');
  const answered = Object.values(answers).filter((v) => v.trim()).length;
  const pct = Math.round((answered / questions.length) * 100);

  const handleSaveAndNavigate = () => { doSave(); navigate(`/interviews/${profileType}`); };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/interviews/${profileType}`)} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <span className="text-2xl">{meta.emoji}</span>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-800">{isNew ? 'Nouvelle interview' : (form.intervieweeName || 'Interview')}</h2>
          <p className="text-slate-400 text-xs">{meta.label}</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-[#00b894] font-medium">Sauvegardé ✓</span>}
          <Button variant="ghost" onClick={handleExport}><Download size={15} /> Export</Button>
          <Button variant="primary" onClick={handleSaveAndNavigate}><Save size={15} /> Sauvegarder</Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 p-3 rounded-lg border border-slate-200 bg-white">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Progression de l'interview</span>
          <span>{answered}/{questions.length} questions renseignées</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.color }} />
        </div>
      </div>

      {/* Meta form */}
      <Card className="mb-6">
        <h3 className="text-slate-700 font-semibold mb-4">Fiche de l'interviewé</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nom complet *</label>
            <Input placeholder="Prénom Nom" value={form.intervieweeName} onChange={(e) => setForm((f) => ({ ...f, intervieweeName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Poste exact</label>
            <Input placeholder="Ex: Chargé de prestations santé" value={form.poste} onChange={(e) => setForm((f) => ({ ...f, poste: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Entreprise</label>
            <Input placeholder="Ex: AXA Assurance Sénégal" value={form.entreprise} onChange={(e) => setForm((f) => ({ ...f, entreprise: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Ancienneté</label>
            <Input placeholder="Ex: 5 ans" value={form.anciennete} onChange={(e) => setForm((f) => ({ ...f, anciennete: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Date</label>
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
      </Card>

      {/* Tronc commun */}
      <div className="mb-4">
        <button onClick={() => setOpenBlocks((b) => ({ ...b, common: !b.common }))}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all mb-1">
          <div className="flex items-center gap-3">
            <Badge variant="common">Tronc commun</Badge>
            <span className="text-slate-700 font-medium text-sm">Questions universelles ({commonQs.length})</span>
          </div>
          {openBlocks.common ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {openBlocks.common && (
          <div className="space-y-3 mt-2">
            {commonQs.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xs font-mono text-purple-500 mt-0.5 flex-shrink-0">C{i + 1}</span>
                  <p className="text-slate-700 text-sm leading-relaxed">{q.text}</p>
                </div>
                <Textarea rows={3} placeholder="Saisir la réponse ici..." value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spécifique */}
      <div className="mb-4">
        <button onClick={() => setOpenBlocks((b) => ({ ...b, specific: !b.specific }))}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all mb-1">
          <div className="flex items-center gap-3">
            <Badge variant="specific">Spécifique</Badge>
            <span className="text-slate-700 font-medium text-sm">{meta.label} ({specificQs.length})</span>
          </div>
          {openBlocks.specific ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {openBlocks.specific && (
          <div className="space-y-3 mt-2">
            {specificQs.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xs font-mono flex-shrink-0 mt-0.5" style={{ color: meta.color }}>S{i + 1}</span>
                  <p className="text-slate-700 text-sm leading-relaxed">{q.text}</p>
                </div>
                <Textarea rows={3} placeholder="Saisir la réponse ici..." value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Métriques capturées */}
      <div className="mb-8">
        <button onClick={() => setOpenBlocks((b) => ({ ...b, metriques: !b.metriques }))}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:border-emerald-300 transition-all mb-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
              <TrendingUp size={12} /> Métriques
            </div>
            <span className="text-slate-700 font-medium text-sm">Chiffres capturés pendant l'interview ({metriques.length})</span>
          </div>
          {openBlocks.metriques ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {openBlocks.metriques && (
          <div className="space-y-3 mt-2">
            <div className="rounded-xl border border-emerald-100 bg-white p-4">
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Note ici tous les chiffres entendus pendant l'interview : temps de traitement, coût fraude estimé, nombre de dossiers par semaine, etc. Ces données alimenteront directement les arguments commerciaux pour Allianz et NSIA.
              </p>
              {metriques.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">Aucune métrique ajoutée. Clique sur "+ Ajouter" pour commencer.</p>
              )}
              <div className="space-y-3">
                {metriques.map((m) => (
                  <MetriqueRow
                    key={m.id}
                    m={m}
                    onChange={handleUpdateMetrique}
                    onDelete={() => handleDeleteMetrique(m.id)}
                  />
                ))}
              </div>
              <Button variant="ghost" onClick={handleAddMetrique} className="mt-3 w-full justify-center border border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                <Plus size={15} /> Ajouter une métrique
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="secondary" onClick={() => navigate(`/interviews/${profileType}`)}>Annuler</Button>
        <Button variant="primary" onClick={handleSaveAndNavigate}><Save size={15} /> Sauvegarder et revenir</Button>
      </div>
    </div>
  );
}
