import type { Node, Edge } from '@xyflow/react'
import type { FlowNodeData } from '@/store/useFlowStore'
import { AgentFlowDesignSchema, type AgentFlowDesign } from './agentflow'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function serialize(
  nodes: Node[],
  edges: Edge[],
  name: string,
  id?: string,
): AgentFlowDesign {
  return {
    version: '1.0',
    id: id ?? generateId(),
    name,
    description: '',
    framework: 'langgraph',
    nodes: nodes.map(n => {
      const d = n.data as FlowNodeData
      return {
        id: n.id,
        type: d.type,
        name: d.name,
        position: n.position,
        data: n.data as Record<string, unknown>,
      }
    }),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: typeof e.label === 'string' ? e.label : undefined,
      data: e.data as Record<string, unknown> | undefined,
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }
}

export function deserialize(design: AgentFlowDesign): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = design.nodes.map(n => ({
    id: n.id,
    type: 'flowNode',
    position: n.position,
    data: n.data as unknown as FlowNodeData,
  }))

  const edges: Edge[] = design.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    data: e.data,
  }))

  return { nodes, edges }
}

export function validateDesign(raw: unknown): { success: true; data: AgentFlowDesign } | { success: false; error: string } {
  const result = AgentFlowDesignSchema.safeParse(raw)
  if (!result.success) {
    const issues = (result.error as { issues?: { path: (string | number)[]; message: string }[] }).issues ?? []
  const first = issues[0]
    if (!first) return { success: false, error: result.error.message }
  const path = first.path.join('.')
    return { success: false, error: path ? `${path}: ${first.message}` : first.message }
  }
  return { success: true, data: result.data }
}
