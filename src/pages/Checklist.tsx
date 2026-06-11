import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { updateChecklistItem } from '../lib/store';
import { Textarea } from '../components/ui';

export default function Checklist() {
  const store = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const checked = store.checklist.filter((c) => c.checked).length;
  const total = store.checklist.length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

  const handleToggle = (id: string) => {
    const item = store.checklist.find((c) => c.id === id);
    if (item) updateChecklistItem({ ...item, checked: !item.checked });
  };

  const handleNotes = (id: string, notes: string) => {
    const item = store.checklist.find((c) => c.id === id);
    if (item) updateChecklistItem({ ...item, notes });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Checklist de connaissances</h2>
        <p className="text-slate-500 text-sm">Prérequis métier à maîtriser avant et pendant le stage</p>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6 flex items-center gap-6 shadow-sm">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00b894" strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-800">{pct}%</span>
          </div>
        </div>
        <div>
          <p className="text-slate-800 font-semibold text-lg">{checked}/{total} maîtrisés</p>
          <p className="text-slate-400 text-sm">{total - checked} item{total - checked !== 1 ? 's' : ''} restant{total - checked !== 1 ? 's' : ''}</p>
          {pct === 100 && <p className="text-[#00b894] text-sm mt-1">🎉 Checklist complète !</p>}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {store.checklist.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className={`rounded-xl border transition-all ${item.checked ? 'border-[#00b894]/30 bg-green-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => handleToggle(item.id)} className="flex-shrink-0 transition-transform hover:scale-110">
                  {item.checked
                    ? <CheckCircle2 size={22} className="text-[#00b894]" />
                    : <Circle size={22} className="text-slate-300" />}
                </button>
                <span
                  className={`flex-1 text-sm leading-relaxed cursor-pointer ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                  onClick={() => handleToggle(item.id)}
                >
                  {item.label}
                </span>
                {item.notes && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">note</span>}
                <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="h-px bg-slate-100 mb-3" />
                  <label className="block text-xs text-slate-500 mb-2">Notes personnelles</label>
                  <Textarea rows={3} placeholder="Ajoute tes notes, sources, points clés..." value={item.notes} onChange={(e) => handleNotes(item.id, e.target.value)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
