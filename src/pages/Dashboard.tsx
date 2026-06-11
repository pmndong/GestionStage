import { useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Eye, Map, CheckSquare, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { PROFILE_META, ALL_PROFILES } from '../data/questions';
import { formatDate } from '../lib/utils';
import { Card } from '../components/ui';

function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: number | string; color: string; onClick?: () => void }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();

  const checklistPct = store.checklist.length > 0
    ? Math.round((store.checklist.filter((c) => c.checked).length / store.checklist.length) * 100)
    : 0;

  // Planning stats
  const semainesTerminees = store.planning.filter((w) => w.statut === 'termine').length;
  const semainesEnCours = store.planning.filter((w) => w.statut === 'en_cours').length;
  const planningPct = Math.round(((semainesTerminees + semainesEnCours * 0.5) / 12) * 100);

  // Métriques
  const totalMetriques = (store.metriques?.length || 0) +
    store.interviews.reduce((acc, iv) => acc + (iv.metriques?.length || 0), 0) +
    store.observations.filter((o) => o.tempsReel).length;

  const radarData = ALL_PROFILES.map((p) => ({
    profil: PROFILE_META[p].emoji + ' ' + PROFILE_META[p].label.split(' ')[0],
    interviews: store.interviews.filter((i) => i.profileType === p).length,
  }));

  type Activity = { type: string; label: string; sub: string; time: string; color: string; emoji: string };
  const activities: Activity[] = [];

  store.interviews.slice(0, 3).forEach((iv) => {
    const meta = PROFILE_META[iv.profileType];
    activities.push({ type: 'interview', label: iv.intervieweeName || 'Sans nom', sub: `Interview ${meta.label}`, time: formatDate(iv.createdAt), color: meta.color, emoji: meta.emoji });
  });
  store.observations.slice(0, 2).forEach((obs) => {
    activities.push({ type: 'obs', label: obs.tacheObservee || 'Observation', sub: `Observation — ${obs.profileObserve}`, time: formatDate(obs.createdAt), color: '#06b6d4', emoji: '👁️' });
  });
  store.processus.slice(0, 2).forEach((p) => {
    activities.push({ type: 'process', label: p.nom, sub: `Processus — ${p.acteurPrincipal}`, time: formatDate(p.createdAt), color: '#f97316', emoji: '🗺️' });
  });
  activities.sort((a, b) => (a.time < b.time ? 1 : -1));

  // Semaine en cours (pour l'afficher en vedette)
  const semaineCourante = store.planning.find((w) => w.statut === 'en_cours') || store.planning.find((w) => w.statut === 'a_venir');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Dashboard</h1>
        <p className="text-slate-500 text-sm">Suivi de ton stage AXA BU Santé — InsurTech Sénégal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        <StatCard icon={<Users size={18} />} label="Interviews" value={store.interviews.length} color="#00b894" onClick={() => navigate('/interviews')} />
        <StatCard icon={<Map size={18} />} label="Processus" value={store.processus.length} color="#8b5cf6" onClick={() => navigate('/processus')} />
        <StatCard icon={<Eye size={18} />} label="Observations" value={store.observations.length} color="#06b6d4" onClick={() => navigate('/observations')} />
        <StatCard icon={<TrendingUp size={18} />} label="Métriques" value={totalMetriques} color="#f97316" onClick={() => navigate('/impact')} />
        <StatCard icon={<CheckSquare size={18} />} label="Checklist" value={`${checklistPct}%`} color="#00b894" onClick={() => navigate('/checklist')} />
      </div>

      {/* Planning banner */}
      {semaineCourante && (
        <div
          className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 cursor-pointer hover:border-blue-300 transition-all"
          onClick={() => navigate('/planning')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  S{semaineCourante.semaine} — {semaineCourante.titre}
                  <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                    {semaineCourante.statut === 'en_cours' ? 'En cours' : 'À venir'}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {semaineCourante.objectifsDone.filter(Boolean).length}/{semaineCourante.objectifs.length} objectifs · Phase {semaineCourante.phase}/3
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-400">Planning global</p>
                <p className="text-sm font-bold text-blue-600">{semainesTerminees}/12 semaines</p>
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${planningPct}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Radar */}
        <Card className="lg:col-span-2">
          <h3 className="text-slate-700 font-semibold mb-4">Couverture par profil métier</h3>
          {store.interviews.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Aucune interview pour l'instant</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="profil" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Interviews" dataKey="interviews" stroke="#00b894" fill="#00b894" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Checklist donut */}
        <Card>
          <h3 className="text-slate-700 font-semibold mb-4">Checklist connaissances</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00b894" strokeWidth="3"
                  strokeDasharray={`${checklistPct} ${100 - checklistPct}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-800">{checklistPct}%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500">
            {store.checklist.filter((c) => c.checked).length}/{store.checklist.length} items maîtrisés
          </p>
          <button onClick={() => navigate('/checklist')} className="mt-3 w-full text-center text-xs text-[#00b894] hover:underline">
            Voir la checklist →
          </button>
        </Card>
      </div>

      {/* Profils */}
      <div className="mb-6">
        <h3 className="text-slate-700 font-semibold mb-3">Profils métier</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {ALL_PROFILES.map((p) => {
            const meta = PROFILE_META[p];
            const count = store.interviews.filter((i) => i.profileType === p).length;
            return (
              <button key={p} onClick={() => navigate(`/interviews/${p}`)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                <span className="text-2xl">{meta.emoji}</span>
                <span className="text-xs text-slate-500 text-center leading-tight">{meta.label.split(' ')[0]}</span>
                <span className="text-xs font-semibold" style={{ color: meta.color }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-slate-400" />
          <h3 className="text-slate-700 font-semibold">Activité récente</h3>
        </div>
        {activities.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Aucune activité pour l'instant. Commence une interview !</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 6).map((act, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: `${act.color}18` }}>
                  {act.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 text-sm truncate">{act.label}</p>
                  <p className="text-slate-400 text-xs">{act.sub}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
