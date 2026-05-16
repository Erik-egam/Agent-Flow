'use client'

import { useEffect, useRef, useState } from 'react'
import Toolbar from '@/components/agentflow/Toolbar'
import NodePalette from '@/components/agentflow/NodePalette'
import Canvas from '@/components/agentflow/Canvas'
import PropertiesPanel from '@/components/agentflow/PropertiesPanel'
import ExecutionDebugger from '@/components/agentflow/ExecutionDebugger'
import SettingsPanel from '@/components/agentflow/SettingsPanel'
import ChatPanel from '@/components/agentflow/ChatPanel'
import KeyboardShortcutsModal from '@/components/agentflow/KeyboardShortcutsModal'
import OnboardingTour, { shouldShowTour } from '@/components/agentflow/OnboardingTour'
import { useTheme } from '@/lib/useTheme'
import { useFlowStore } from '@/store/useFlowStore'
import { serialize, deserialize, validateDesign } from '@/lib/schema/serialize'

async function captureThumbnail(): Promise<string | undefined> {
  try {
    const { default: html2canvas } = await import('html2canvas')
    const el = document.querySelector('.react-flow__renderer') as HTMLElement | null
    if (!el) return undefined
    const canvas = await html2canvas(el, {
      backgroundColor: null,
      scale: 1,
      logging: false,
      useCORS: true,
    })
    const thumb = document.createElement('canvas')
    thumb.width = 400
    thumb.height = 225
    const ctx = thumb.getContext('2d')
    if (!ctx) return undefined
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 400, 225)
    return thumb.toDataURL('image/png')
  } catch {
    return undefined
  }
}

const AUTOSAVE_INTERVAL = 30_000

export default function EditorPage() {
  const {
    nodes, edges, designId, designName, isDirty, isSaving,
    undo, redo,
    setDesignName, setDirty, setSaving, loadDesign, resetDesign,
  } = useFlowStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDebugger, setShowDebugger] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    if (shouldShowTour()) setShowTour(true)
  }, [])

  const importRef = useRef<HTMLInputElement>(null)
  const savedIdRef = useRef<string | null>(designId)
  // Ref to always call the latest saveDesign from keyboard handlers
  const saveDesignRef = useRef<(onlyIfDirty?: boolean) => Promise<void>>(() => Promise.resolve())

  // Keep savedIdRef in sync with designId (set via loadDesign)
  useEffect(() => {
    if (designId) savedIdRef.current = designId
  }, [designId])

  // Mark dirty on mount if not loaded from DB (no designId)
  useEffect(() => {
    if (!designId && nodes.length > 0) setDirty(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts — use ref so the handler always sees the latest saveDesign
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      if (e.key === '?' && !mod) { setShowShortcuts(s => !s); return }
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
      else if (e.key === 's') { e.preventDefault(); saveDesignRef.current(false) }
      else if (e.key === 'Enter') { e.preventDefault(); setShowDebugger(s => !s) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  // Auto-save every 30s when dirty
  useEffect(() => {
    const id = setInterval(() => { if (isDirty) saveDesign(true) }, AUTOSAVE_INTERVAL)
    return () => clearInterval(id)
  }, [isDirty]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveDesign(onlyIfDirty = true) {
    if (onlyIfDirty && !isDirty) return
    if (isSaving) return
    if (nodes.length === 0) return  // nothing to save on empty canvas
    setSaving(true)
    try {
      const currentId = savedIdRef.current
      const thumbnail = await captureThumbnail()
      const design = serialize(nodes, edges, designName, currentId ?? undefined, thumbnail)
      const isNew = !currentId

      const res = await fetch(isNew ? '/api/designs' : `/api/designs/${currentId}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design }),
      })

      if (res.ok) {
        const data = await res.json() as { id: string }
        savedIdRef.current = data.id
        // Update store designId if it was a new design
        if (isNew) loadDesign(nodes, edges, data.id, designName)
        else setDirty(false)
      } else {
        const err = await res.json() as { error?: string }
        console.error('[AgentFlow] Save failed:', err.error)
      }
    } catch (err) {
      console.error('[AgentFlow] Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  // Keep ref in sync on every render so keyboard handler always calls latest version
  saveDesignRef.current = saveDesign

  function handleNew() {
    if (isDirty) {
      const ok = confirm('Discard unsaved changes and start a new design?')
      if (!ok) return
    }
    savedIdRef.current = null
    resetDesign()
    setSelectedId(null)
    setShowDebugger(false)
  }

  async function handleExport() {
    const thumbnail = await captureThumbnail()
    const design = serialize(nodes, edges, designName, savedIdRef.current ?? undefined, thumbnail)
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
      savedIdRef.current = validation.data.id
    } catch { alert('Could not parse the file.') }
    e.target.value = ''
  }

  return (
    <div className="af-screen">
      <Toolbar
        name={designName}
        dirty={isDirty && nodes.length > 0}
        saving={isSaving}
        runState={showDebugger ? 'running' : 'idle'}
        chatActive={showChat}
        theme={theme}
        onRun={() => setShowDebugger(s => !s)}
        onChat={() => setShowChat(s => !s)}
        onSave={() => saveDesign(false)}
        onNew={handleNew}
        onExport={handleExport}
        onImport={() => importRef.current?.click()}
        onSettings={() => setShowSettings(true)}
        onShortcuts={() => setShowShortcuts(s => !s)}
        onThemeToggle={toggleTheme}
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
        {showChat && (
          <ChatPanel designId={designId} onClose={() => setShowChat(false)} />
        )}
      </div>
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
    </div>
  )
}
