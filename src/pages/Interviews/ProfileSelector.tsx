import { useNavigate } from 'react-router-dom';
import { ALL_PROFILES, PROFILE_META } from '../../data/questions';
import { useStore } from '../../lib/useStore';

export default function ProfileSelector() {
  const navigate = useNavigate();
  const store = useStore();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-1">Interviews</h2>
      <p className="text-slate-500 text-sm mb-6">Sélectionne un profil pour démarrer ou consulter les interviews</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ALL_PROFILES.map((profile) => {
          const meta = PROFILE_META[profile];
          const count = store.interviews.filter((i) => i.profileType === profile).length;
          return (
            <button
              key={profile}
              onClick={() => navigate(`/interviews/${profile}`)}
              className="group text-left rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:border-slate-300 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{meta.emoji}</span>
                {count > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${meta.color}18`, color: meta.color }}>
                    {count} interview{count > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h3 className="text-slate-800 font-semibold text-sm leading-tight mb-1">{meta.label}</h3>
              <p className="text-slate-400 text-xs">
                {count === 0 ? 'Aucune interview' : `${count} fiche${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}`}
              </p>
              <div className="mt-3 h-0.5 rounded-full w-0 group-hover:w-full transition-all duration-300" style={{ background: meta.color }} />
            </button>
          );
        })}
      </div>

      {store.interviews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-slate-700 font-semibold mb-3">Interviews récentes</h3>
          <div className="space-y-2">
            {store.interviews.slice(0, 5).map((iv) => {
              const meta = PROFILE_META[iv.profileType];
              const answered = iv.answers.filter((a) => a.answer.trim()).length;
              return (
                <button key={iv.id} onClick={() => navigate(`/interviews/${iv.profileType}/${iv.id}`)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left">
                  <span className="text-xl">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 text-sm font-medium truncate">{iv.intervieweeName || 'Sans nom'}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${meta.color}18`, color: meta.color }}>{meta.label}</span>
                    </div>
                    <p className="text-slate-400 text-xs truncate">{iv.entreprise} • {new Date(iv.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{answered} rép.</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
