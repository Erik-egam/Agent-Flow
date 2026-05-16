'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  type NodeMouseHandler,
  type OnConnect,
} from '@xyflow/react'
import { useFlowStore, NODE_DEFAULTS } from '@/store/useFlowStore'
import { NODE_TYPES } from './constants'
import FlowNode from './FlowNode'
import FlowEdge from './FlowEdge'
import GroupNode from './GroupNode'
import { validateCanvas } from '@/lib/validation/canvas'

const nodeTypes = { flowNode: FlowNode, groupNode: GroupNode }
const edgeTypes = { flowEdge: FlowEdge }

interface CanvasProps {
  onSelectNode: (id: string | null) => void
  children?: ReactNode
}

function CanvasFlow({ onSelectNode }: CanvasProps) {
  const store = useFlowStore()
  const { screenToFlowPosition } = useReactFlow()
  const validationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced validation — avoids triggering on every keystroke in PropertiesPanel
  useEffect(() => {
    if (validationTimer.current) clearTimeout(validationTimer.current)
    validationTimer.current = setTimeout(() => {
      const issues = validateCanvas(store.nodes, store.edges)
      store.setValidationIssues(issues)
    }, 500)
    return () => { if (validationTimer.current) clearTimeout(validationTimer.current) }
  }, [store.nodes, store.edges]) // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/agentflow')
      if (!type || !NODE_TYPES[type]) return
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })

      if (type === 'group') {
        store.addNode({
          id: `g-${Date.now()}`,
          type: 'groupNode',
          position,
          style: { width: 280, height: 180, zIndex: -1 },
          data: { label: 'Group', color: 'rgba(99,102,241,0.08)' },
        })
        return
      }

      store.addNode({
        id: `n-${Date.now()}`,
        type: 'flowNode',
        position,
        data: {
          ...(NODE_DEFAULTS[type] ?? {}),
          type,
          name: NODE_TYPES[type].label,
          chips: [],
          status: 'idle',
        },
      })
    },
    [screenToFlowPosition, store],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => onSelectNode(node.id),
    [onSelectNode],
  )

  const onPaneClick = useCallback(() => onSelectNode(null), [onSelectNode])

  const onConnect: OnConnect = useCallback(
    (connection) => store.onConnect(connection),
    [store],
  )

  return (
    <ReactFlow
      nodes={store.nodes}
      edges={store.edges}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      deleteKeyCode="Delete"
      multiSelectionKeyCode="Shift"
      selectionOnDrag
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{ type: 'flowEdge' }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="rgba(255,255,255,0.06)"
      />
      <MiniMap
        nodeColor={() => 'rgba(255,255,255,0.1)'}
        maskColor="rgba(10,10,10,0.55)"
        style={{
          background: 'rgba(17,17,17,0.85)',
          border: '1px solid var(--border-strong)',
          borderRadius: 8,
        }}
      />
      <Controls showInteractive={false} position="top-left" />
    </ReactFlow>
  )
}

export default function Canvas({ onSelectNode, children }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <div className="af-canvas-wrap">
        <CanvasFlow onSelectNode={onSelectNode} />
        {children}
      </div>
    </ReactFlowProvider>
  )
}
