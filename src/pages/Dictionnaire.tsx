import { useState } from 'react';
import { Plus, Trash2, Pencil, Search, Download } from 'lucide-react';
import type { DictEntry, DictCategorie } from '../types';
import { useStore } from '../lib/useStore';
import { saveDictEntry, deleteDictEntry } from '../lib/store';
import { uid, exportTxt } from '../lib/utils';
import { Button, Input, Textarea, Select, Card, EmptyState } from '../components/ui';

const CATEGORIES: { value: DictCategorie; label: string; color: string }[] = [
  { value: 'reglementaire', label: 'Réglementaire', color: '#ef4444' },
  { value: 'operationnel',  label: 'Opérationnel',  color: '#3b82f6' },
  { value: 'technique',     label: 'Technique',     color: '#8b5cf6' },
  { value: 'commercial',    label: 'Commercial',    color: '#f59e0b' },
  { value: 'wolof',         label: 'Wolof',         color: '#10b981' },
];

function emptyEntry(): DictEntry {
  return { id: uid(), terme: '', definition: '', categorie: 'operationnel', source: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

function CatBadge({ cat }: { cat: DictCategorie }) {
  const c = CATEGORIES.find((x) => x.value === cat);
  if (!c) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${c.color}18`, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function Dictionnaire() {
  const store = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DictEntry>(emptyEntry());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<DictCategorie | 'all'>('all');

  const handleOpen = (entry?: DictEntry) => { setForm(entry ? { ...entry } : emptyEntry()); setShowForm(true); };
  const handleSave = () => { saveDictEntry({ ...form, updatedAt: new Date().toISOString() }); setShowForm(false); };
  const handleDelete = (id: string) => { if (confirm('Supprimer ce terme ?')) deleteDictEntry(id); };

  const handleExportMd = () => {
    const lines = ['# Dictionnaire métier InsurTech Sénégal', ''];
    for (const cat of CATEGORIES) {
      const entries = store.dictionnaire.filter((e) => e.categorie === cat.value);
      if (!entries.length) continue;
      lines.push(`## ${cat.label}`, '');
      for (const e of entries) {
        lines.push(`### ${e.terme}`, e.definition, e.source ? `*Source : ${e.source}*` : '', '');
      }
    }
    exportTxt('dictionnaire_metier.md', lines.join('\n'));
  };

  const setField = <K extends keyof DictEntry>(k: K, v: DictEntry[K]) => setForm((f) => ({ ...f, [k]: v }));

  const filtered = store.dictionnaire.filter((e) => {
    if (filterCat !== 'all' && e.categorie !== filterCat) return false;
    if (search && !e.terme.toLowerCase().includes(search.toLowerCase()) && !e.definition.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<string, DictEntry[]> = {};
  for (const e of filtered.sort((a, b) => a.terme.localeCompare(b.terme, 'fr'))) {
    const letter = e.terme[0]?.toUpperCase() ?? '#';
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(e);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-1">Dictionnaire métier</h2>
          <p className="text-slate-500 text-sm">{store.dictionnaire.length} terme{store.dictionnaire.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {store.dictionnaire.length > 0 && <Button variant="ghost" onClick={handleExportMd}><Download size={15} /> Markdown</Button>}
          <Button variant="primary" onClick={() => handleOpen()}><Plus size={16} /> Nouveau terme</Button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-slate-800 font-semibold text-lg mb-4">{form.terme ? 'Modifier le terme' : 'Nouveau terme'}</h3>
            <div className="space-y-3 mb-6">
              <div><label className="block text-xs text-slate-500 mb-1">Terme *</label><Input placeholder="Ex: Tiers payant" value={form.terme} onChange={(e) => setField('terme', e.target.value)} /></div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Catégorie</label>
                <Select value={form.categorie} onChange={(e) => setField('categorie', e.target.value as DictCategorie)}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>
              <div><label className="block text-xs text-slate-500 mb-1">Définition *</label><Textarea rows={4} placeholder="Définition claire et précise..." value={form.definition} onChange={(e) => setField('definition', e.target.value)} /></div>
              <div><label className="block text-xs text-slate-500 mb-1">Source</label><Input placeholder="Qui m'a dit ça / où je l'ai lu" value={form.source} onChange={(e) => setField('source', e.target.value)} /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button variant="primary" onClick={handleSave} disabled={!form.terme || !form.definition}>Sauvegarder</Button>
            </div>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-8" placeholder="Rechercher un terme..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-auto" value={filterCat} onChange={(e) => setFilterCat(e.target.value as DictCategorie | 'all')}>
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
      </div>

      {/* Content */}
      {store.dictionnaire.length === 0 ? (
        <EmptyState icon="📖" title="Dictionnaire vide" description="Ajoute les termes métier que tu découvres pendant le stage" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Aucun résultat" description="Modifie ta recherche ou les filtres" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([letter, entries]) => (
            <div key={letter}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>{letter}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-2">
                {entries.map((entry) => (
                  <Card key={entry.id} className="group hover:shadow-sm hover:border-slate-300 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-slate-800 font-semibold">{entry.terme}</span>
                          <CatBadge cat={entry.categorie} />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-1">{entry.definition}</p>
                        {entry.source && <p className="text-xs text-slate-400 italic">Source : {entry.source}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => handleOpen(entry)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#00b894] hover:bg-green-50 transition-all"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
