'use client'
import { useState } from 'react'
import Toolbar from '@/components/agentflow/Toolbar'
import NodePalette from '@/components/agentflow/NodePalette'
import Canvas from '@/components/agentflow/Canvas'
import PropertiesPanel from '@/components/agentflow/PropertiesPanel'
import ExecutionDebugger from '@/components/agentflow/ExecutionDebugger'
import { SAMPLE_NODES, SAMPLE_EDGES } from '@/components/agentflow/constants'

export default function EditorPage() {
  const [selectedId, setSelectedId] = useState('n2')
  const [showDebugger, setShowDebugger] = useState(false)
  const [runState, setRunState] = useState<'idle' | 'running'>('idle')
  const [activePromptTab, setActivePromptTab] = useState<'config' | 'prompt' | 'conn'>('config')
  const [showGenerateDrawer, setShowGenerateDrawer] = useState(false)

  const selectedNode = SAMPLE_NODES.find(n => n.id === selectedId)

  return (
    <div className="af-screen">
      <Toolbar
        name="Science research pipeline"
        runState={runState}
        onRun={() => {
          setRunState(r => (r === 'idle' ? 'running' : 'idle'))
          setShowDebugger(s => !s)
        }}
      />
      <div className="af-body">
        <NodePalette />
        <Canvas
          nodes={SAMPLE_NODES}
          edges={SAMPLE_EDGES}
          selectedId={selectedId}
          onSelectNode={setSelectedId}
          nodeStatuses={
            runState === 'running'
              ? { n1: 'ok', n2: 'ok', n3: 'run', n4: 'idle', n5: 'ok', n6: 'idle', n7: 'idle' }
              : {}
          }
          activeEdges={
            runState === 'running'
              ? new Set(['n1->n2', 'n2->n3', 'n3->n5'])
              : new Set()
          }
          showDebugger={showDebugger}
        >
          {showDebugger && (
            <ExecutionDebugger
              onClose={() => {
                setShowDebugger(false)
                setRunState('idle')
              }}
            />
          )}
        </Canvas>
        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onClose={() => setSelectedId('')}
            activeTab={activePromptTab}
            onTabChange={setActivePromptTab}
            onShowGenerateDrawer={() => setShowGenerateDrawer(true)}
            showGenerateDrawer={showGenerateDrawer}
            onCloseDrawer={() => setShowGenerateDrawer(false)}
          />
        )}
      </div>
    </div>
  )
}
