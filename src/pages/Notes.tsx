import { useState } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { saveNote, deleteNote } from '../lib/store';
import type { Note, NoteCouleur } from '../types';
import { uid } from '../lib/utils';

const COULEURS: { value: NoteCouleur; bg: string; border: string; dot: string }[] = [
  { value: 'jaune',  bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  { value: 'bleu',   bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
  { value: 'vert',   bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  { value: 'rouge',  bg: '#fff1f2', border: '#fecdd3', dot: '#f43f5e' },
  { value: 'violet', bg: '#f5f3ff', border: '#ddd6fe', dot: '#8b5cf6' },
];

function getCouleur(c: NoteCouleur) {
  return COULEURS.find((x) => x.value === c) ?? COULEURS[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

function NoteCard({ note, onEdit }: NoteCardProps) {
  const c = getCouleur(note.couleur);
  return (
    <div
      className="rounded-xl border p-4 cursor-pointer hover:shadow-md transition-shadow relative group"
      style={{ background: c.bg, borderColor: c.border }}
      onClick={() => onEdit(note)}
    >
      <button
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1 rounded"
        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
        title="Supprimer"
      >
        <Trash2 size={14} />
      </button>
      {note.titre && (
        <p className="font-semibold text-slate-800 text-sm mb-1 pr-6 truncate">{note.titre}</p>
      )}
      <p className="text-slate-600 text-sm whitespace-pre-wrap line-clamp-6">{note.contenu}</p>
      <p className="text-xs text-slate-400 mt-3">{formatDate(note.updatedAt)}</p>
    </div>
  );
}

interface NoteModalProps {
  note: Note | null;
  onClose: () => void;
}

function NoteModal({ note, onClose }: NoteModalProps) {
  const [titre, setTitre] = useState(note?.titre ?? '');
  const [contenu, setContenu] = useState(note?.contenu ?? '');
  const [couleur, setCouleur] = useState<NoteCouleur>(note?.couleur ?? 'jaune');

  const handleSave = () => {
    if (!contenu.trim() && !titre.trim()) return;
    const now = new Date().toISOString();
    saveNote({
      id: note?.id ?? uid(),
      titre: titre.trim(),
      contenu: contenu.trim(),
      couleur,
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    });
    onClose();
  };

  const c = getCouleur(couleur);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border shadow-xl p-5 flex flex-col gap-4"
        style={{ background: c.bg, borderColor: c.border }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">{note ? 'Modifier la note' : 'Nouvelle note'}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded"><X size={16} /></button>
        </div>

        {/* Couleurs */}
        <div className="flex gap-2">
          {COULEURS.map((col) => (
            <button
              key={col.value}
              onClick={() => setCouleur(col.value)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: col.dot, borderColor: couleur === col.value ? '#1e293b' : col.dot }}
              title={col.value}
            />
          ))}
        </div>

        {/* Titre */}
        <input
          className="bg-transparent border-b border-slate-300 focus:border-slate-500 outline-none text-slate-800 font-semibold placeholder-slate-400 text-sm py-1"
          placeholder="Titre (optionnel)"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
        />

        {/* Contenu */}
        <textarea
          className="bg-transparent outline-none text-slate-700 text-sm resize-none placeholder-slate-400 min-h-[160px]"
          placeholder="Écris ta note, idée, réflexion..."
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          autoFocus
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-slate-500 hover:bg-black/5 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!contenu.trim() && !titre.trim()}
            className="text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const store = useStore();
  const notes = store.notes ?? [];
  const [modal, setModal] = useState<Note | null | 'new'>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">Notes & Brainstorming</h1>
          <p className="text-slate-500 text-sm">Capture tes idées, réflexions et hypothèses en cours de stage</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: '#00b894' }}
        >
          <Plus size={16} /> Nouvelle note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-2xl">
            📝
          </div>
          <p className="text-slate-600 font-medium mb-1">Aucune note pour l'instant</p>
          <p className="text-slate-400 text-sm mb-4">Capture tes premières idées ou observations terrain</p>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: '#00b894' }}
          >
            <Plus size={16} /> Créer une note
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="break-inside-avoid">
              <NoteCard note={note} onEdit={(n) => setModal(n)} />
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <NoteModal
          note={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
