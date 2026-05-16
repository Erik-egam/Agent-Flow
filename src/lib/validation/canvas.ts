import type { Node, Edge } from '@xyflow/react'
import type { FlowNodeData } from '@/store/useFlowStore'

export type IssueLevel = 'error' | 'warning'

export interface CanvasIssue {
  nodeId: string
  level: IssueLevel
  message: string
}

export function validateCanvas(nodes: Node[], edges: Edge[]): CanvasIssue[] {
  const issues: CanvasIssue[] = []

  const connectedSources = new Set(edges.map(e => e.source))
  const connectedTargets = new Set(edges.map(e => e.target))

  const hasInput = nodes.some(n => (n.data as FlowNodeData).type === 'input')
  const hasOutput = nodes.some(n => (n.data as FlowNodeData).type === 'output')

  for (const node of nodes) {
    const d = node.data as FlowNodeData
    const isInput = d.type === 'input'
    const isOutput = d.type === 'output'
    const isNote = d.type === 'note'
    const isGroup = d.type === 'group'

    if (isNote || isGroup) continue

    const hasOutgoing = connectedSources.has(node.id)
    const hasIncoming = connectedTargets.has(node.id)

    if (!isInput && !hasIncoming) {
      issues.push({ nodeId: node.id, level: 'error', message: 'Node has no incoming connection' })
    }
    if (!isOutput && !hasOutgoing) {
      issues.push({ nodeId: node.id, level: 'error', message: 'Node has no outgoing connection' })
    }

    if (d.type === 'agent' && !String(d.systemPrompt ?? '').trim()) {
      issues.push({ nodeId: node.id, level: 'warning', message: 'Agent has no system prompt' })
    }
    if (d.type === 'subgraph' && !String(d.designId ?? '').trim()) {
      issues.push({ nodeId: node.id, level: 'error', message: 'Subgraph has no referenced design' })
    }
    if (d.type === 'orchestrator' && !String(d.systemPrompt ?? '').trim()) {
      issues.push({ nodeId: node.id, level: 'warning', message: 'Orchestrator has no system prompt' })
    }
  }

  if (nodes.length > 0 && !hasInput) {
    issues.push({ nodeId: '__canvas__', level: 'error', message: 'Design has no Input node' })
  }
  if (nodes.length > 0 && !hasOutput) {
    issues.push({ nodeId: '__canvas__', level: 'warning', message: 'Design has no Output node' })
  }

  return issues
}
