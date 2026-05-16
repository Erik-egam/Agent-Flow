import { create } from 'zustand'
import {
  Node, Edge, NodeChange, EdgeChange, Connection,
  applyNodeChanges, applyEdgeChanges, addEdge,
} from '@xyflow/react'
import type { CanvasIssue } from '@/lib/validation/canvas'

export interface FlowNodeData extends Record<string, unknown> {
  type: string
  name: string
  chips: { k: string; v: string }[]
  status: 'ok' | 'run' | 'err' | 'idle'
}

export type NodeType = FlowNodeData['type']

type HistoryEntry = { nodes: Node[]; edges: Edge[] }
const MAX_HISTORY = 50

// ── Auto-computed chips per node type ───────────────────────
function computeChips(type: string, d: Record<string, unknown>): FlowNodeData['chips'] {
  switch (type) {
    case 'input':   return [{ k: 'var:', v: String(d.outputVar ?? 'query') }]
    case 'output':  return [{ k: 'format:', v: String(d.format ?? 'markdown') }]
    case 'agent':   return [{ k: 'model:', v: String(d.model ?? 'claude-sonnet-4-5') }, { k: 'temp:', v: String(d.temperature ?? 0.7) }]
    case 'tool':    return [{ k: 'fn:', v: String(d.functionName ?? 'unnamed') }]
    case 'orchestrator': return [{ k: 'model:', v: String(d.model ?? 'gpt-4o') }, { k: 'routes:', v: String(Array.isArray(d.routes) ? d.routes.length : 0) }]
    case 'memory':  return [{ k: 'backend:', v: String(d.backend ?? 'sqlite') }, { k: 'k:', v: String(d.k ?? 12) }]
    case 'conditional': return [{ k: 'routes:', v: String(Array.isArray(d.routes) ? d.routes.length : 0) }]
    case 'human':   return [{ k: 'type:', v: String(d.inputType ?? 'approval') }]
    case 'state':   return [{ k: 'fields:', v: String(Array.isArray(d.fields) ? d.fields.length : 0) }]
    case 'subgraph':return [{ k: 'design:', v: String(d.designId ?? 'none') }]
    default:        return []
  }
}

// ── Default config per node type ────────────────────────────
export const NODE_DEFAULTS: Record<string, Record<string, unknown>> = {
  input:        { outputVar: 'query', schema: '' },
  output:       { inputVar: 'result', format: 'markdown' },
  agent:        { provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.7, maxTokens: 4096, systemPrompt: '' },
  tool:         { functionName: '', description: '', parameters: [] as { name: string; type: string; required: boolean; description: string }[], returnType: 'string' },
  orchestrator: { provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.3, systemPrompt: '', routes: [] as { agent: string; when: string; priority: 'high' | 'normal' | 'low'; isDefault: boolean }[] },
  memory:       { backend: 'sqlite', collection: 'default', k: 12 },
  conditional:  { routes: [] as { condition: string; label: string; isDefault: boolean }[] },
  human:        { promptMessage: 'Please review and approve:', inputType: 'approval', timeout: 0 },
  state:        { fields: [] as { key: string; type: string; default: string }[] },
  subgraph:     { designId: '' },
  note:         { content: '' },
}

// ── Initial demo canvas ──────────────────────────────────────
const S = 'idle' as FlowNodeData['status']
const INITIAL_NODES: Node<FlowNodeData>[] = ([
  { id: 'n1', type: 'flowNode', position: { x: 60,   y: 200 }, data: { type: 'input',        name: 'User Query',      status: S, chips: [], outputVar: 'query', schema: '{ query: string }' } },
  { id: 'n2', type: 'flowNode', position: { x: 320,  y: 200 }, data: { type: 'orchestrator', name: 'Research Router', status: S, chips: [], provider: 'openai', model: 'gpt-4o', temperature: 0.3, systemPrompt: '', routes: [{ agent: 'Web Researcher', when: 'query contains URLs or "search"', priority: 'high', isDefault: false }, { agent: 'Code Analyst', when: 'query contains code or technical analysis', priority: 'normal', isDefault: true }] } },
  { id: 'n3', type: 'flowNode', position: { x: 620,  y: 80  }, data: { type: 'agent',        name: 'Web Researcher',  status: S, chips: [], provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.7, maxTokens: 4096, systemPrompt: '' } },
  { id: 'n4', type: 'flowNode', position: { x: 620,  y: 320 }, data: { type: 'agent',        name: 'Code Analyst',    status: S, chips: [], provider: 'openai', model: 'gpt-4o-mini', temperature: 0.5, maxTokens: 4096, systemPrompt: '' } },
  { id: 'n5', type: 'flowNode', position: { x: 920,  y: 50  }, data: { type: 'tool',         name: 'web_search',      status: S, chips: [], functionName: 'web_search', description: 'Searches the web', parameters: [{ name: 'query', type: 'string', required: true, description: 'Search query' }], returnType: 'SearchResult[]' } },
  { id: 'n6', type: 'flowNode', position: { x: 920,  y: 200 }, data: { type: 'memory',       name: 'Episodic',        status: S, chips: [], backend: 'sqlite', collection: 'default', k: 12 } },
  { id: 'n7', type: 'flowNode', position: { x: 1220, y: 200 }, data: { type: 'output',       name: 'Final Answer',    status: S, chips: [], inputVar: 'result', format: 'markdown' } },
] as Node<FlowNodeData>[]).map(n => ({ ...n, data: { ...n.data, chips: computeChips(n.data.type, n.data as Record<string, unknown>) } }))

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', type: 'flowEdge', source: 'n1', target: 'n2' },
  { id: 'e2', type: 'flowEdge', source: 'n2', target: 'n3', label: 'web', data: { when: 'query contains URLs or "search"' } },
  { id: 'e3', type: 'flowEdge', source: 'n2', target: 'n4', label: 'code', data: { when: 'query contains code or technical analysis' } },
  { id: 'e4', type: 'flowEdge', source: 'n3', target: 'n5' },
  { id: 'e5', type: 'flowEdge', source: 'n3', target: 'n6' },
  { id: 'e6', type: 'flowEdge', source: 'n4', target: 'n6' },
  { id: 'e7', type: 'flowEdge', source: 'n3', target: 'n7' },
  { id: 'e8', type: 'flowEdge', source: 'n4', target: 'n7' },
]

// ── Store interface ──────────────────────────────────────────
interface FlowStore {
  nodes: Node[]
  edges: Edge[]
  past: HistoryEntry[]
  future: HistoryEntry[]

  // Design meta
  designId: string | null
  designName: string
  isDirty: boolean
  isSaving: boolean

  // Validation (does not affect isDirty)
  validationIssues: Record<string, CanvasIssue>

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (node: Node) => void
  updateNodeData: (id: string, patch: Record<string, unknown>) => void
  loadDesign: (nodes: Node[], edges: Edge[], id: string, name: string) => void
  resetDesign: () => void
  setDesignName: (name: string) => void
  setDirty: (dirty: boolean) => void
  setSaving: (saving: boolean) => void
  setNodeStatus: (id: string, status: FlowNodeData['status']) => void
  setActiveEdges: (ids: Set<string>) => void
  setValidationIssues: (issues: CanvasIssue[]) => void
  undo: () => void
  redo: () => void
}

function snap(state: { nodes: Node[]; edges: Edge[] }): HistoryEntry {
  return { nodes: state.nodes, edges: state.edges }
}

export const useFlowStore = create<FlowStore>((set) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  past: [],
  future: [],
  designId: null,
  designName: 'Untitled design',
  isDirty: false,
  isSaving: false,
  validationIssues: {},

  onNodesChange: (changes) => set(state => {
    const shouldRecord = changes.some(c =>
      c.type === 'remove' ||
      (c.type === 'position' && (c as { type: 'position'; dragging?: boolean }).dragging === false)
    )
    const hasStructuralChange = changes.some(c => c.type !== 'select' && c.type !== 'dimensions')
    return {
      nodes: applyNodeChanges(changes, state.nodes),
      past: shouldRecord ? [...state.past, snap(state)].slice(-MAX_HISTORY) : state.past,
      future: shouldRecord ? [] : state.future,
      isDirty: hasStructuralChange ? true : state.isDirty,
    }
  }),

  onEdgesChange: (changes) => set(state => {
    const shouldRecord = changes.some(c => c.type === 'remove')
    const hasStructuralChange = changes.some(c => c.type !== 'select')
    return {
      edges: applyEdgeChanges(changes, state.edges),
      past: shouldRecord ? [...state.past, snap(state)].slice(-MAX_HISTORY) : state.past,
      future: shouldRecord ? [] : state.future,
      isDirty: hasStructuralChange ? true : state.isDirty,
    }
  }),

  onConnect: (connection) => set(state => ({
    edges: addEdge({ ...connection, id: `e-${Date.now()}`, type: 'flowEdge' }, state.edges),
    past: [...state.past, snap(state)].slice(-MAX_HISTORY),
    future: [],
    isDirty: true,
  })),

  addNode: (node) => set(state => ({
    nodes: [...state.nodes, node],
    past: [...state.past, snap(state)].slice(-MAX_HISTORY),
    future: [],
    isDirty: true,
  })),

  loadDesign: (nodes, edges, id, name) => set({
    nodes,
    edges,
    designId: id,
    designName: name,
    isDirty: false,
    isSaving: false,
    past: [],
    future: [],
  }),

  resetDesign: () => set({
    nodes: [],
    edges: [],
    designId: null,
    designName: 'Untitled design',
    isDirty: false,
    isSaving: false,
    past: [],
    future: [],
  }),

  setDesignName: (name) => set({ designName: name, isDirty: true }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),

  updateNodeData: (id, patch) => set(state => ({
    nodes: state.nodes.map(n => {
      if (n.id !== id) return n
      const d = { ...n.data, ...patch } as Record<string, unknown>
      return { ...n, data: { ...d, chips: computeChips(d.type as string, d) } }
    }),
    isDirty: true,
  })),

  setNodeStatus: (id, status) => set(state => ({
    nodes: state.nodes.map(n =>
      n.id === id ? { ...n, data: { ...n.data, status } } : n
    ),
  })),

  setActiveEdges: (ids) => set(state => ({
    edges: state.edges.map(e => ({ ...e, animated: ids.has(e.id) })),
  })),

  setValidationIssues: (issues) => set(() => ({
    validationIssues: Object.fromEntries(
      issues.filter(i => i.nodeId !== '__canvas__').map(i => [i.nodeId, i])
    ),
  })),

  undo: () => set(state => {
    if (state.past.length === 0) return state
    const prev = state.past[state.past.length - 1]
    return {
      nodes: prev.nodes,
      edges: prev.edges,
      past: state.past.slice(0, -1),
      future: [snap(state), ...state.future].slice(0, MAX_HISTORY),
    }
  }),

  redo: () => set(state => {
    if (state.future.length === 0) return state
    const next = state.future[0]
    return {
      nodes: next.nodes,
      edges: next.edges,
      past: [...state.past, snap(state)].slice(-MAX_HISTORY),
      future: state.future.slice(1),
    }
  }),
}))
