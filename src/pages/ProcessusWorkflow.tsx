import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type Connection,
  type Node,
  type Edge,
  type NodeProps,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Save, Plus, Trash2, RotateCcw } from 'lucide-react';

// ─── Node Types ────────────────────────────────────────────────────────────────

function EditableLabel({
  label,
  onEdit,
}: {
  label: string;
  onEdit: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(label);

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { setEditing(false); onEdit(val); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); onEdit(val); } }}
        className="bg-transparent text-center outline-none w-full text-xs font-medium"
        style={{ color: 'inherit' }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return (
    <span
      className="text-xs font-medium text-center leading-tight cursor-text select-none"
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="Double-clic pour éditer"
    >
      {label || 'Double-clic'}
    </span>
  );
}

// Start node — green circle
function StartNode({ data, selected }: NodeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 transition-all"
      style={{
        width: 90, height: 90,
        background: '#00b894',
        borderColor: selected ? '#fff' : '#00966e',
        boxShadow: selected ? '0 0 0 3px #00b89466' : 'none',
        color: '#fff',
      }}
    >
      <Handle type="source" position={Position.Right} style={{ background: '#00966e' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#00966e' }} />
      <EditableLabel label={String(data.label ?? 'Début')} onEdit={(v) => (data.onLabelChange as (v: string) => void)(v)} />
    </div>
  );
}

// Process node — yellow rectangle
function ProcessNode({ data, selected }: NodeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border-2 px-4 py-3 transition-all"
      style={{
        minWidth: 150, minHeight: 60,
        background: '#f9c74f',
        borderColor: selected ? '#fff' : '#d4a017',
        boxShadow: selected ? '0 0 0 3px #f9c74f66' : 'none',
        color: '#1a1a1a',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#d4a017' }} />
      <Handle type="target" position={Position.Top} style={{ background: '#d4a017' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#d4a017' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#d4a017' }} />
      <EditableLabel label={String(data.label ?? 'Étape')} onEdit={(v) => (data.onLabelChange as (v: string) => void)(v)} />
    </div>
  );
}

// Decision node — black diamond
function DecisionNode({ data, selected }: NodeProps) {
  return (
    <div style={{ width: 110, height: 110, position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555', top: 6, left: '50%' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#555', left: 6, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555', right: 6, top: '50%' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: 6, left: '50%' }} />
      <div
        className="flex items-center justify-center"
        style={{
          width: 78, height: 78,
          background: '#1c2129',
          border: `2px solid ${selected ? '#fff' : '#555'}`,
          transform: 'rotate(45deg)',
          position: 'absolute',
          top: 16, left: 16,
          boxShadow: selected ? '0 0 0 3px #ffffff33' : 'none',
        }}
      />
      <div
        className="flex items-center justify-center"
        style={{
          position: 'absolute', inset: 0,
          color: '#e8eaf0',
        }}
      >
        <EditableLabel label={String(data.label ?? 'Décision ?')} onEdit={(v) => (data.onLabelChange as (v: string) => void)(v)} />
      </div>
    </div>
  );
}

// End node — red circle
function EndNode({ data, selected }: NodeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 transition-all"
      style={{
        width: 90, height: 90,
        background: '#ef4444',
        borderColor: selected ? '#fff' : '#b91c1c',
        boxShadow: selected ? '0 0 0 3px #ef444466' : 'none',
        color: '#fff',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#b91c1c' }} />
      <Handle type="target" position={Position.Top} style={{ background: '#b91c1c' }} />
      <EditableLabel label={String(data.label ?? 'Fin')} onEdit={(v) => (data.onLabelChange as (v: string) => void)(v)} />
    </div>
  );
}

// Annotation node — rounded rectangle with note style
function AnnotationNode({ data, selected }: NodeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border-2 px-4 py-2"
      style={{
        minWidth: 130, minHeight: 50,
        background: '#e8f4f8',
        borderColor: selected ? '#3b82f6' : '#93c5fd',
        color: '#1e3a5f',
        borderStyle: 'dashed',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6' }} />
      <EditableLabel label={String(data.label ?? 'Note')} onEdit={(v) => (data.onLabelChange as (v: string) => void)(v)} />
    </div>
  );
}

const NODE_TYPES = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  end: EndNode,
  annotation: AnnotationNode,
};

// ─── Default workflow ──────────────────────────────────────────────────────────

const DEFAULT_NODES: Node[] = [
  { id: 'start-1', type: 'start', position: { x: 60, y: 200 }, data: { label: 'Début' } },
  { id: 'process-1', type: 'process', position: { x: 220, y: 210 }, data: { label: 'Étape 1' } },
  { id: 'decision-1', type: 'decision', position: { x: 430, y: 195 }, data: { label: 'Décision ?' } },
  { id: 'process-2', type: 'process', position: { x: 610, y: 160 }, data: { label: 'Oui → Suite' } },
  { id: 'end-1', type: 'end', position: { x: 650, y: 370 }, data: { label: 'Fin' } },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1-2', source: 'start-1', target: 'process-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#7a8499' } },
  { id: 'e2-3', source: 'process-1', target: 'decision-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#7a8499' } },
  { id: 'e3-yes', source: 'decision-1', target: 'process-2', label: 'Oui', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#00b894' }, labelStyle: { fill: '#00b894', fontWeight: 600 }, labelBgStyle: { fill: '#0c0f14' } },
  { id: 'e3-no', source: 'decision-1', target: 'end-1', label: 'Non', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#ef4444' }, labelStyle: { fill: '#ef4444', fontWeight: 600 }, labelBgStyle: { fill: '#0c0f14' } },
  { id: 'e4-end', source: 'process-2', target: 'end-1', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#7a8499' } },
];

// ─── NODE PALETTE ─────────────────────────────────────────────────────────────

type NodeTypeKey = 'start' | 'process' | 'decision' | 'end' | 'annotation';
const NODE_PALETTE: { type: NodeTypeKey; label: string; color: string; shape: string }[] = [
  { type: 'start',      label: 'Début',     color: '#00b894', shape: '●' },
  { type: 'process',    label: 'Processus', color: '#f9c74f', shape: '■' },
  { type: 'decision',   label: 'Décision',  color: '#e8eaf0', shape: '◆' },
  { type: 'end',        label: 'Fin',       color: '#ef4444', shape: '●' },
  { type: 'annotation', label: 'Note',      color: '#93c5fd', shape: '▭' },
];

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  processusNom: string;
  initialData?: string; // JSON
  onSave: (data: string) => void;
  onClose: () => void;
}

export default function ProcessusWorkflow({ processusNom, initialData, onSave, onClose }: Props) {
  const parsed = initialData ? JSON.parse(initialData) : null;
  const [nodes, setNodes, onNodesChange] = useNodesState(parsed?.nodes ?? DEFAULT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(parsed?.edges ?? DEFAULT_EDGES);
  const nodeIdRef = useRef(100);

  // Inject onLabelChange into each node's data
  const nodesWithHandlers = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onLabelChange: (val: string) => {
        setNodes((ns) => ns.map((x) => x.id === n.id ? { ...x, data: { ...x.data, label: val } } : x));
      },
    },
  }));

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge({
        ...connection,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#7a8499' },
      }, eds)
    );
  }, [setEdges]);

  const addNode = (type: NodeTypeKey) => {
    const id = `${type}-${++nodeIdRef.current}`;
    const defaultLabels: Record<NodeTypeKey, string> = {
      start: 'Début', process: 'Nouvelle étape', decision: 'Décision ?', end: 'Fin', annotation: 'Note',
    };
    const newNode: Node = {
      id,
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: defaultLabels[type] },
    };
    setNodes((ns) => [...ns, newNode]);
  };

  const deleteSelected = () => {
    setNodes((ns) => ns.filter((n) => !n.selected));
    setEdges((es) => es.filter((e) => !e.selected));
  };

  const reset = () => {
    if (confirm('Réinitialiser le workflow ? Les modifications seront perdues.')) {
      setNodes(DEFAULT_NODES);
      setEdges(DEFAULT_EDGES);
    }
  };

  const handleSave = () => {
    // Save without handlers (clean serializable data)
    const cleanNodes = nodes.map(({ data: { onLabelChange: _drop, ...rest }, ...n }) => ({ ...n, data: rest }));
    onSave(JSON.stringify({ nodes: cleanNodes, edges }));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#252d3a] flex-shrink-0" style={{ background: '#151920' }}>
        <button onClick={onClose} className="text-[#7a8499] hover:text-[#e8eaf0] transition-colors">
          <X size={18} />
        </button>
        <span className="text-[#7a8499] text-sm">🗺️</span>
        <span className="text-[#e8eaf0] font-semibold text-sm truncate">{processusNom}</span>
        <span className="text-xs text-[#7a8499] bg-[#252d3a] px-2 py-0.5 rounded ml-1">Workflow</span>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#7a8499]">
          <span>Double-clic sur un nœud pour éditer</span>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#252d3a] text-[#7a8499] hover:text-red-400 hover:border-red-700/40 transition-all"
          >
            <Trash2 size={13} /> Supprimer sél.
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#252d3a] text-[#7a8499] hover:text-[#e8eaf0] transition-all"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-white transition-all"
            style={{ background: '#00b894' }}
          >
            <Save size={14} /> Sauvegarder
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{ background: '#ffffff' }}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#d1d5db"
          />
          <Controls
            style={{ background: '#1c2129', border: '1px solid #252d3a', borderRadius: 8 }}
          />

          {/* Node palette */}
          <Panel position="top-left">
            <div
              className="flex flex-col gap-2 p-3 rounded-xl border border-[#252d3a]"
              style={{ background: '#151920' }}
            >
              <p className="text-[10px] text-[#7a8499] uppercase tracking-widest font-semibold mb-1">Ajouter</p>
              {NODE_PALETTE.map(({ type, label, color, shape }) => (
                <button
                  key={type}
                  onClick={() => addNode(type)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#252d3a] hover:border-[#3a4455] text-[#e8eaf0] hover:bg-[#1c2129] transition-all text-xs font-medium"
                >
                  <Plus size={12} className="text-[#7a8499] flex-shrink-0" />
                  <span style={{ color, fontSize: 16, lineHeight: 1 }}>{shape}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </Panel>

          {/* Legend */}
          <Panel position="bottom-left">
            <div
              className="text-[10px] text-[#7a8499] p-2 rounded-lg border border-[#252d3a] space-y-1"
              style={{ background: '#151920' }}
            >
              <p className="font-semibold mb-1">Aide</p>
              <p>Drag depuis un handle → connecter</p>
              <p>Shift+clic → sélection multiple</p>
              <p>Del → supprimer sélection</p>
              <p>Molette → zoom</p>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
