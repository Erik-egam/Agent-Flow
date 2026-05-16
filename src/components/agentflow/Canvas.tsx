'use client'

import { useCallback, useMemo, type ReactNode } from 'react'
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
import { useFlowStore } from '@/store/useFlowStore'
import { NODE_TYPES } from './constants'
import FlowNode from './FlowNode'

const nodeTypes = { flowNode: FlowNode }

interface CanvasProps {
  onSelectNode: (id: string | null) => void
  children?: ReactNode
}

function CanvasFlow({ onSelectNode }: CanvasProps) {
  const store = useFlowStore()
  const { screenToFlowPosition } = useReactFlow()

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
      store.addNode({
        id: `n-${Date.now()}`,
        type: 'flowNode',
        position,
        data: {
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
      defaultEdgeOptions={{ type: 'smoothstep' }}
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
