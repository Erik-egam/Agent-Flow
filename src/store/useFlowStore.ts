import { create } from 'zustand'
import {
  Node, Edge, NodeChange, EdgeChange, Connection,
  applyNodeChanges, applyEdgeChanges, addEdge,
} from '@xyflow/react'

export interface FlowNodeData extends Record<string, unknown> {
  type: string
  name: string
  chips: { k: string; v: string }[]
  status: 'ok' | 'run' | 'err' | 'idle'
}

type HistoryEntry = { nodes: Node[]; edges: Edge[] }

const MAX_HISTORY = 50

const INITIAL_NODES: Node<FlowNodeData>[] = [
  { id: 'n1', type: 'flowNode', position: { x: 60,   y: 200 }, data: { type: 'input',        name: 'User Query',      chips: [{ k: 'schema:', v: '{ query: string }' }], status: 'idle' } },
  { id: 'n2', type: 'flowNode', position: { x: 320,  y: 200 }, data: { type: 'orchestrator', name: 'Research Router', chips: [{ k: 'model:', v: 'gpt-4o' }, { k: 'rules:', v: '2 sub-agents' }], status: 'idle' } },
  { id: 'n3', type: 'flowNode', position: { x: 620,  y: 80  }, data: { type: 'agent',        name: 'Web Researcher',  chips: [{ k: 'model:', v: 'claude-sonnet-4' }, { k: 'type:', v: 'react' }], status: 'idle' } },
  { id: 'n4', type: 'flowNode', position: { x: 620,  y: 320 }, data: { type: 'agent',        name: 'Code Analyst',    chips: [{ k: 'model:', v: 'gpt-4o-mini' }, { k: 'tools:', v: '2' }], status: 'idle' } },
  { id: 'n5', type: 'flowNode', position: { x: 920,  y: 50  }, data: { type: 'tool',         name: 'web_search',      chips: [{ k: 'provider:', v: 'tavily' }], status: 'idle' } },
  { id: 'n6', type: 'flowNode', position: { x: 920,  y: 200 }, data: { type: 'memory',       name: 'Episodic',        chips: [{ k: 'backend:', v: 'sqlite' }, { k: 'k:', v: '12' }], status: 'idle' } },
  { id: 'n7', type: 'flowNode', position: { x: 1220, y: 200 }, data: { type: 'output',       name: 'Final Answer',    chips: [{ k: 'format:', v: 'markdown' }], status: 'idle' } },
]

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', target: 'n3', label: 'web' },
  { id: 'e3', source: 'n2', target: 'n4', label: 'code' },
  { id: 'e4', source: 'n3', target: 'n5' },
  { id: 'e5', source: 'n3', target: 'n6' },
  { id: 'e6', source: 'n4', target: 'n6' },
  { id: 'e7', source: 'n3', target: 'n7' },
  { id: 'e8', source: 'n4', target: 'n7' },
]

interface FlowStore {
  nodes: Node[]
  edges: Edge[]
  past: HistoryEntry[]
  future: HistoryEntry[]

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (node: Node) => void
  setNodeStatus: (id: string, status: FlowNodeData['status']) => void
  setActiveEdges: (ids: Set<string>) => void
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

  onNodesChange: (changes) => set(state => {
    const shouldRecord = changes.some(c =>
      c.type === 'remove' ||
      (c.type === 'position' && (c as { type: 'position'; dragging?: boolean }).dragging === false)
    )
    return {
      nodes: applyNodeChanges(changes, state.nodes),
      past: shouldRecord ? [...state.past, snap(state)].slice(-MAX_HISTORY) : state.past,
      future: shouldRecord ? [] : state.future,
    }
  }),

  onEdgesChange: (changes) => set(state => {
    const shouldRecord = changes.some(c => c.type === 'remove')
    return {
      edges: applyEdgeChanges(changes, state.edges),
      past: shouldRecord ? [...state.past, snap(state)].slice(-MAX_HISTORY) : state.past,
      future: shouldRecord ? [] : state.future,
    }
  }),

  onConnect: (connection) => set(state => ({
    edges: addEdge({ ...connection, id: `e-${Date.now()}` }, state.edges),
    past: [...state.past, snap(state)].slice(-MAX_HISTORY),
    future: [],
  })),

  addNode: (node) => set(state => ({
    nodes: [...state.nodes, node],
    past: [...state.past, snap(state)].slice(-MAX_HISTORY),
    future: [],
  })),

  setNodeStatus: (id, status) => set(state => ({
    nodes: state.nodes.map(n =>
      n.id === id ? { ...n, data: { ...n.data, status } } : n
    ),
  })),

  setActiveEdges: (ids) => set(state => ({
    edges: state.edges.map(e => ({ ...e, animated: ids.has(e.id) })),
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
