'use client'

import { ReactNode } from 'react'
import Icon from './Icon'
import CanvasNode from './CanvasNode'
import { SampleNode, SampleEdge } from './constants'

interface CanvasProps {
  nodes: SampleNode[]
  edges: SampleEdge[]
  selectedId: string
  onSelectNode: (id: string) => void
  nodeStatuses?: Record<string, 'ok' | 'run' | 'err' | 'idle'>
  activeEdges?: Set<string>
  showDebugger?: boolean
  children?: ReactNode
}

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.45)
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
}

function getHandleY(node: SampleNode): number {
  const chipsHeight = node.chips.length > 0 ? 8 + node.chips.length * 26 + 4 : 0
  return node.y + (38 + chipsHeight) / 2
}

export default function Canvas({
  nodes,
  edges,
  selectedId,
  onSelectNode,
  nodeStatuses = {},
  activeEdges = new Set(),
  showDebugger = false,
  children,
}: CanvasProps) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  // Collect which nodes have connections
  const hasInSet = new Set(edges.map(e => e.to))
  const hasOutSet = new Set(edges.map(e => e.from))

  return (
    <div className="af-canvas-wrap" style={{ position: 'relative' }}>
      <div className="af-grid" />
      <div className="af-grid-fade" />

      {/* SVG edges */}
      <svg className="af-edges" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        {edges.map((edge, i) => {
          const fromNode = nodeMap[edge.from]
          const toNode = nodeMap[edge.to]
          if (!fromNode || !toNode) return null

          const x1 = fromNode.x + 200
          const y1 = getHandleY(fromNode)
          const x2 = toNode.x
          const y2 = getHandleY(toNode)
          const edgeKey = `${edge.from}->${edge.to}`
          const isActive = activeEdges.has(edgeKey)
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2

          return (
            <g key={i}>
              <path
                className={`af-edge${isActive ? ' active' : ''}`}
                d={edgePath(x1, y1, x2, y2)}
              />
              {edge.label && (
                <text
                  className="af-edge-label"
                  x={mx}
                  y={my - 4}
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <CanvasNode
          key={node.id}
          id={node.id}
          type={node.type}
          name={node.name}
          chips={node.chips}
          x={node.x}
          y={node.y}
          selected={selectedId === node.id}
          status={nodeStatuses[node.id] ?? 'idle'}
          hasIn={hasInSet.has(node.id)}
          hasOut={hasOutSet.has(node.id)}
          onClick={onSelectNode}
        />
      ))}

      {/* Canvas toolbar */}
      <div className="af-tool-stack" style={{ left: 14, top: 14 }}>
        <button className="af-tool-btn" title="Zoom in">
          <Icon name="plus" size={13} />
        </button>
        <div className="af-tool-zoom">100%</div>
        <button className="af-tool-btn" title="Zoom out">
          <Icon name="minus" size={13} />
        </button>
        <button className="af-tool-btn" title="Fit view">
          <Icon name="focus" size={13} />
        </button>
      </div>

      {/* Minimap */}
      <div className="af-minimap">
        {/* Mini representation of nodes */}
        <svg width="180" height="120" viewBox="0 0 1500 600">
          {nodes.map(node => (
            <rect
              key={node.id}
              x={node.x}
              y={node.y}
              width={200}
              height={60}
              rx={4}
              fill={selectedId === node.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}
              stroke={selectedId === node.id ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={2}
            />
          ))}
          {edges.map((edge, i) => {
            const fromNode = nodeMap[edge.from]
            const toNode = nodeMap[edge.to]
            if (!fromNode || !toNode) return null
            return (
              <line
                key={i}
                x1={fromNode.x + 200}
                y1={fromNode.y + 30}
                x2={toNode.x}
                y2={toNode.y + 30}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={3}
              />
            )
          })}
          <rect x={0} y={60} width={800} height={480} rx={6} fill="none" stroke="var(--indigo)" strokeWidth={6} opacity={0.6} />
        </svg>
      </div>

      {/* Debugger slot */}
      {children}
    </div>
  )
}
