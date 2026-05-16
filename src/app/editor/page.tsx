'use client'

import { useEffect, useState } from 'react'
import Toolbar from '@/components/agentflow/Toolbar'
import NodePalette from '@/components/agentflow/NodePalette'
import Canvas from '@/components/agentflow/Canvas'
import PropertiesPanel from '@/components/agentflow/PropertiesPanel'
import ExecutionDebugger from '@/components/agentflow/ExecutionDebugger'
import { useFlowStore } from '@/store/useFlowStore'

export default function EditorPage() {
  const { undo, redo, setNodeStatus, setActiveEdges } = useFlowStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDebugger, setShowDebugger] = useState(false)
  const [runState, setRunState] = useState<'idle' | 'running'>('idle')

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  function toggleRun() {
    const next = runState === 'idle' ? 'running' : 'idle'
    setRunState(next)
    setShowDebugger(next === 'running')
    if (next === 'running') {
      setNodeStatus('n1', 'ok'); setNodeStatus('n2', 'ok'); setNodeStatus('n3', 'run')
      setNodeStatus('n4', 'idle'); setNodeStatus('n5', 'ok'); setNodeStatus('n6', 'idle'); setNodeStatus('n7', 'idle')
      setActiveEdges(new Set(['e1', 'e2', 'e4']))
    } else {
      ;['n1','n2','n3','n4','n5','n6','n7'].forEach(id => setNodeStatus(id, 'idle'))
      setActiveEdges(new Set())
    }
  }

  function stopRun() {
    setShowDebugger(false); setRunState('idle')
    ;['n1','n2','n3','n4','n5','n6','n7'].forEach(id => setNodeStatus(id, 'idle'))
    setActiveEdges(new Set())
  }

  return (
    <div className="af-screen">
      <Toolbar name="Science research pipeline" runState={runState} onRun={toggleRun} />
      <div className="af-body">
        <NodePalette />
        <Canvas onSelectNode={setSelectedId}>
          {showDebugger && <ExecutionDebugger onClose={stopRun} />}
        </Canvas>
        {selectedId && (
          <PropertiesPanel nodeId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  )
}
