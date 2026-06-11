import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Download } from 'lucide-react';
import { PROFILE_META, getQuestionsForProfile } from '../../data/questions';
import type { ProfileType } from '../../types';
import { useStore } from '../../lib/useStore';
import { deleteInterview } from '../../lib/store';
import { uid, formatDate, exportTxt } from '../../lib/utils';
import { Button, Card, Badge, EmptyState } from '../../components/ui';

export default function InterviewList() {
  const { profile } = useParams<{ profile: string }>();
  const navigate = useNavigate();
  const store = useStore();
  const profileType = profile as ProfileType;
  const meta = PROFILE_META[profileType];

  if (!meta) { navigate('/interviews'); return null; }

  const interviews = store.interviews.filter((i) => i.profileType === profileType);

  const handleNew = () => navigate(`/interviews/${profileType}/${uid()}?new=1`);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Supprimer cette interview ?')) deleteInterview(id);
  };

  const handleExport = (iv: typeof interviews[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const questions = getQuestionsForProfile(profileType);
    const lines = [
      `# Interview — ${meta.emoji} ${meta.label}`, ``,
      `**Interviewé :** ${iv.intervieweeName}`, `**Poste :** ${iv.poste}`,
      `**Entreprise :** ${iv.entreprise}`, `**Ancienneté :** ${iv.anciennete}`,
      `**Date :** ${formatDate(iv.date)}`, ``, `---`, ``,
    ];
    for (const q of questions) {
      const ans = iv.answers.find((a) => a.questionId === q.id)?.answer || '';
      lines.push(`### [${q.type === 'common' ? 'Tronc commun' : 'Spécifique'}] ${q.text}`, ``, ans || '_Sans réponse_', ``);
    }
    exportTxt(`interview_${iv.intervieweeName}_${iv.date}.md`, lines.join('\n'));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/interviews')} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <span className="text-2xl">{meta.emoji}</span>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{meta.label}</h2>
          <p className="text-slate-400 text-xs">{interviews.length} interview{interviews.length > 1 ? 's' : ''}</p>
        </div>
        <div className="ml-auto">
          <Button variant="primary" onClick={handleNew}><Plus size={16} /> Nouvelle interview</Button>
        </div>
      </div>

      {interviews.length === 0 ? (
        <EmptyState icon={meta.emoji} title="Aucune interview" description={`Clique sur "Nouvelle interview" pour démarrer`} />
      ) : (
        <div className="grid gap-3">
          {interviews.map((iv) => {
            const answered = iv.answers.filter((a) => a.answer.trim()).length;
            const total = getQuestionsForProfile(profileType).length;
            const pct = Math.round((answered / total) * 100);
            return (
              <Card key={iv.id} className="cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group">
                <div className="flex items-start gap-4" onClick={() => navigate(`/interviews/${profileType}/${iv.id}`)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-800 font-semibold">{iv.intervieweeName || 'Sans nom'}</span>
                      <Badge variant="default">{iv.poste}</Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{iv.entreprise} • {formatDate(iv.date)}{iv.anciennete ? ` • ${iv.anciennete}` : ''}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{answered}/{total} réponses</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleExport(iv, e)} title="Exporter"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#00b894] hover:bg-green-50 transition-all">
                      <Download size={15} />
                    </button>
                    <button onClick={(e) => handleDelete(iv.id, e)} title="Supprimer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
