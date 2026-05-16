export type RunStatus = 'pending' | 'running' | 'completed' | 'failed'

export type EventType =
  | 'run_start'
  | 'node_start'
  | 'node_stream'
  | 'node_complete'
  | 'node_error'
  | 'run_complete'
  | 'run_error'

export interface ExecutionEvent {
  type: EventType
  runId: string
  timestamp: number
  nodeId?: string
  nodeName?: string
  nodeType?: string
  text?: string
  output?: string
  error?: string
  tokenCount?: number
  status?: RunStatus
  totalTokens?: number
  duration?: number
}

export interface RunConfig {
  nodes: SerializedNode[]
  edges: SerializedEdge[]
  input: string
  designId?: string
}

export interface SerializedNode {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface SerializedEdge {
  id: string
  source: string
  target: string
  label?: string
}
