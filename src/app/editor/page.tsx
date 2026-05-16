'use client'

import { useEffect, useRef, useState } from 'react'
import Toolbar from '@/components/agentflow/Toolbar'
import NodePalette from '@/components/agentflow/NodePalette'
import Canvas from '@/components/agentflow/Canvas'
import PropertiesPanel from '@/components/agentflow/PropertiesPanel'
import ExecutionDebugger from '@/components/agentflow/ExecutionDebugger'
import SettingsPanel from '@/components/agentflow/SettingsPanel'
import { useFlowStore } from '@/store/useFlowStore'
import { serialize, deserialize, validateDesign } from '@/lib/schema/serialize'

const AUTOSAVE_INTERVAL = 30_000

export default function EditorPage() {
  const {
    nodes, edges, designId, designName, isDirty, isSaving,
    undo, redo,
    setDesignName, setDirty, setSaving, loadDesign,
  } = useFlowStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDebugger, setShowDebugger] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const importRef = useRef<HTMLInputElement>(null)
  const lastSavedId = useRef<string | null>(designId)

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
      else if (e.key === 's') { e.preventDefault(); saveDesign() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo, isDirty, nodes, edges, designId, designName])

  // Auto-save every 30s
  useEffect(() => {
    const id = setInterval(() => { if (isDirty) saveDesign() }, AUTOSAVE_INTERVAL)
    return () => clearInterval(id)
  }, [isDirty, nodes, edges, designId, designName])

  async function saveDesign() {
    if (!isDirty) return
    setSaving(true)
    try {
      const currentId = lastSavedId.current ?? designId
      const design = serialize(nodes, edges, designName, currentId ?? undefined)
      const isNew = !currentId
      const res = await fetch(isNew ? '/api/designs' : `/api/designs/${currentId}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design }),
      })
      if (res.ok) {
        const data = await res.json() as { id: string }
        lastSavedId.current = data.id
        setDirty(false)
      }
    } finally { setSaving(false) }
  }

  function handleExport() {
    const design = serialize(nodes, edges, designName, designId ?? undefined)
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${designName.replace(/\s+/g, '-').toLowerCase()}.agentflow.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const raw = JSON.parse(text) as unknown
      const validation = validateDesign(raw)
      if (!validation.success) { alert(`Invalid file: ${validation.error}`); return }
      const { nodes: n, edges: ed } = deserialize(validation.data)
      loadDesign(n, ed, validation.data.id, validation.data.name)
      lastSavedId.current = validation.data.id
    } catch { alert('Could not parse the file.') }
    e.target.value = ''
  }

  return (
    <div className="af-screen">
      <Toolbar
        name={designName}
        dirty={isDirty}
        saving={isSaving}
        runState={showDebugger ? 'running' : 'idle'}
        onRun={() => setShowDebugger(s => !s)}
        onExport={handleExport}
        onImport={() => importRef.current?.click()}
        onSettings={() => setShowSettings(true)}
        onNameChange={setDesignName}
      />
      <input ref={importRef} type="file" accept=".json,.agentflow.json" style={{ display: 'none' }} onChange={handleImportFile} />

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <div className="af-body">
        <NodePalette />
        <Canvas onSelectNode={setSelectedId}>
          {showDebugger && <ExecutionDebugger onClose={() => setShowDebugger(false)} />}
        </Canvas>
        {selectedId && (
          <PropertiesPanel nodeId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  )
}
