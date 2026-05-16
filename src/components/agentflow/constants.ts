export const NODE_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  input:        { label: 'Input',        icon: 'arrow-right-to-bracket',  color: 'var(--c-input)' },
  output:       { label: 'Output',       icon: 'arrow-right-from-bracket',color: 'var(--c-output)' },
  agent:        { label: 'Agent',        icon: 'cpu',                     color: 'var(--c-agent)' },
  tool:         { label: 'Tool',         icon: 'wrench',                  color: 'var(--c-tool)' },
  orchestrator: { label: 'Orchestrator', icon: 'sitemap',                 color: 'var(--c-orchestrator)' },
  memory:       { label: 'Memory',       icon: 'database',                color: 'var(--c-memory)' },
  conditional:  { label: 'Conditional',  icon: 'git-branch',              color: 'var(--c-conditional)' },
  human:        { label: 'Human Loop',   icon: 'user',                    color: 'var(--c-human)' },
  state:        { label: 'State Node',   icon: 'layers',                  color: 'var(--c-state)' },
  subgraph:     { label: 'Subgraph',     icon: 'package',                 color: 'var(--c-subgraph)' },
  note:         { label: 'Note',         icon: 'sticky-note',             color: 'var(--c-note)' },
  group:        { label: 'Group',        icon: 'square-dashed',           color: 'rgba(99,102,241,0.15)' },
}

export const PALETTE_CATS = [
  { id: 'io',     label: 'I/O',          items: ['input', 'output'] },
  { id: 'core',   label: 'Core',         items: ['agent', 'tool'] },
  { id: 'flow',   label: 'Control Flow', items: ['conditional', 'human'] },
  { id: 'mem',    label: 'Memory',       items: ['memory'] },
  { id: 'orch',   label: 'Orchestration',items: ['orchestrator', 'state'] },
  { id: 'struct', label: 'Structure',    items: ['subgraph', 'note', 'group'] },
]

export interface SampleNode {
  id: string
  type: string
  name: string
  x: number
  y: number
  chips: { k: string; v: string }[]
}

export interface SampleEdge {
  from: string
  to: string
  label?: string
}

export const SAMPLE_NODES: SampleNode[] = [
  { id:'n1', type:'input',        name:'User Query',         x: 60,  y: 200, chips:[{k:'schema:', v:'{ query: string }'}] },
  { id:'n2', type:'orchestrator', name:'Research Router',    x: 320, y: 200, chips:[{k:'model:', v:'gpt-4o'}, {k:'rules:', v:'2 sub-agents'}] },
  { id:'n3', type:'agent',        name:'Web Researcher',     x: 620, y: 80,  chips:[{k:'model:', v:'claude-sonnet-4'}, {k:'type:', v:'react'}] },
  { id:'n4', type:'agent',        name:'Code Analyst',       x: 620, y: 320, chips:[{k:'model:', v:'gpt-4o-mini'}, {k:'tools:', v:'2'}] },
  { id:'n5', type:'tool',         name:'web_search',         x: 920, y: 50,  chips:[{k:'provider:', v:'tavily'}] },
  { id:'n6', type:'memory',       name:'Episodic',           x: 920, y: 200, chips:[{k:'backend:', v:'sqlite'}, {k:'k:', v:'12'}] },
  { id:'n7', type:'output',       name:'Final Answer',       x: 1220, y: 200, chips:[{k:'format:', v:'markdown'}] },
]

export const SAMPLE_EDGES: SampleEdge[] = [
  { from:'n1', to:'n2' },
  { from:'n2', to:'n3', label:'web' },
  { from:'n2', to:'n4', label:'code' },
  { from:'n3', to:'n5' },
  { from:'n3', to:'n6' },
  { from:'n4', to:'n6' },
  { from:'n3', to:'n7' },
  { from:'n4', to:'n7' },
]
