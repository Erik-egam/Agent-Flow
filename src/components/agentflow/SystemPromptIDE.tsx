'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Icon from './Icon'
import { NODE_TYPES } from './constants'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })
const MonacoDiffEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.DiffEditor),
  { ssr: false }
)

// ── Streaming helper ─────────────────────────────────────────

async function streamFetch(
  url: string,
  body: unknown,
  onChunk: (accumulated: string) => void,
  onError: (msg: string) => void,
): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    onError(`API error ${res.status} — check your AI_API_KEY in .env.local`)
    return ''
  }
  if (!res.body) { onError('No response stream'); return '' }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    accumulated += decoder.decode(value, { stream: true })
    onChunk(accumulated)
  }
  return accumulated
}

// ── Generate Drawer ──────────────────────────────────────────

interface GenerateDrawerProps {
  nodeName: string
  onClose: () => void
  onResult: (text: string) => void
}

function GenerateDrawer({ nodeName, onClose, onResult }: GenerateDrawerProps) {
  const [role, setRole] = useState(`${nodeName} AI agent`)
  const [context, setContext] = useState('')
  const [constraints, setConstraints] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [outputFormat, setOutputFormat] = useState('text')
  const [style, setStyle] = useState('precise')
  const [fewShot, setFewShot] = useState('')
  const [showFewShot, setShowFewShot] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState('')
  const [error, setError] = useState('')

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      setConstraints(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  async function generate() {
    setLoading(true)
    setStreaming('')
    setError('')
    const text = await streamFetch(
      '/api/ai/prompt/generate',
      { role, context, constraints, outputFormat, style, fewShot },
      chunk => setStreaming(chunk),
      setError,
    )
    setLoading(false)
    if (text) { onResult(text); onClose() }
  }

  return (
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--surface-1)', borderLeft: '1px solid var(--border-strong)', display: 'flex', flexDirection: 'column', zIndex: 50, boxShadow: '-8px 0 32px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--indigo-dim)', display: 'grid', placeItems: 'center', color: 'var(--indigo-2)' }}>
            <Icon name="sparkles" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Generate System Prompt</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>AI writes the optimal prompt for you</div>
          </div>
        </div>
        <button className="af-btn af-btn-ghost" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>

      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="af-field">
          <label className="af-label">Agent role *</label>
          <input className="af-input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Research orchestrator…" />
        </div>
        <div className="af-field">
          <label className="af-label">Context & background</label>
          <textarea className="af-textarea" style={{ minHeight: 72 }} value={context} onChange={e => setContext(e.target.value)} placeholder="What system is this agent part of?" />
        </div>
        <div className="af-field">
          <label className="af-label">Constraints & behavior</label>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', borderRadius: 6, padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {constraints.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11.5, color: 'var(--text-2)' }}>
                {t}
                <button onClick={() => setConstraints(c => c.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 0, display: 'flex' }}>
                  <Icon name="x" size={10} />
                </button>
              </span>
            ))}
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add + Enter…" style={{ background: 'none', border: 'none', outline: 'none', fontSize: 11.5, color: 'var(--text)', fontFamily: 'var(--font-ui)', minWidth: 80 }} />
          </div>
        </div>
        <div className="af-field">
          <label className="af-label">Output format</label>
          <select className="af-select" value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
            <option value="text">Plain text</option>
            <option value="json">JSON — structured response</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
        <button onClick={() => setShowFewShot(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 11.5, fontFamily: 'var(--font-ui)', padding: '2px 0' }}>
          <Icon name={showFewShot ? 'chevron-down' : 'chevron-right'} size={11} />Few-shot examples (optional)
        </button>
        {showFewShot && <textarea className="af-textarea" style={{ minHeight: 60 }} value={fewShot} onChange={e => setFewShot(e.target.value)} placeholder={'User: "query"\nAssistant: { "route": "web" }'} />}
        <button onClick={() => setShowAdvanced(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 11.5, fontFamily: 'var(--font-ui)', padding: '2px 0' }}>
          <Icon name={showAdvanced ? 'chevron-down' : 'chevron-right'} size={11} />Advanced options
        </button>
        {showAdvanced && (
          <div className="af-field" style={{ marginBottom: 0 }}>
            <label className="af-label">Writing style</label>
            <select className="af-select" value={style} onChange={e => setStyle(e.target.value)}>
              <option value="precise">Precise & technical</option>
              <option value="friendly">Friendly & conversational</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        )}

        {streaming && (
          <div style={{ background: '#1e1e1e', borderRadius: 6, padding: '10px 12px', fontSize: 11.5, fontFamily: 'var(--font-mono)', color: '#d4d4d4', lineHeight: 1.55, maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
            {streaming}<span style={{ display: 'inline-block', width: 2, height: 13, background: 'var(--indigo)', marginLeft: 2, animation: 'af-blink 0.7s step-end infinite', verticalAlign: 'middle' }} />
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#fca5a5' }}>{error}</div>
        )}
      </div>

      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-4)', fontSize: 11, marginRight: 'auto' }}>
          <Icon name="sparkles" size={11} /><span style={{ fontFamily: 'var(--font-mono)' }}>AI_MODEL</span>
        </div>
        <button className="af-btn" onClick={onClose}>Cancel</button>
        <button className="af-btn af-btn-primary" style={{ gap: 7 }} onClick={generate} disabled={loading || !role.trim()}>
          {loading ? <><Icon name="loader" size={12} />Generating…</> : <><Icon name="sparkles" size={12} />Generate</>}
        </button>
      </div>
    </div>
  )
}

// ── Refine bar ───────────────────────────────────────────────

interface RefineBarProps {
  onRefine: (instruction: string) => Promise<void>
  onClose: () => void
  loading: boolean
}

function RefineBar({ onRefine, onClose, loading }: RefineBarProps) {
  const [instruction, setInstruction] = useState('')
  return (
    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'rgba(139,92,246,0.08)', display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ color: '#a78bfa', display: 'flex', flexShrink: 0 }}><Icon name="wand" size={13} /></span>
      <input className="af-input" style={{ flex: 1, height: 28, fontSize: 12, borderColor: 'rgba(139,92,246,0.3)' }}
        value={instruction} onChange={e => setInstruction(e.target.value)}
        placeholder="Refinement instruction (e.g. 'Make it more concise')"
        onKeyDown={e => { if (e.key === 'Enter' && instruction.trim()) onRefine(instruction) }}
        autoFocus />
      <button className="af-btn" style={{ fontSize: 11, height: 28, background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.3)', color: '#a78bfa' }}
        onClick={() => instruction.trim() && onRefine(instruction)} disabled={loading}>
        {loading ? 'Refining…' : 'Refine'}
      </button>
      <button className="af-btn af-btn-ghost" style={{ height: 28, padding: '4px 7px' }} onClick={onClose}>
        <Icon name="x" size={12} />
      </button>
    </div>
  )
}

// ── SystemPromptIDE ──────────────────────────────────────────

interface SystemPromptIDEProps {
  nodeId: string
  nodeName: string
  nodeType: string
  systemPrompt: string
  onPromptChange: (value: string) => void
  onTabChange: (tab: 'config' | 'prompt') => void
}

export default function SystemPromptIDE({ nodeId: _nodeId, nodeName, nodeType, systemPrompt, onPromptChange, onTabChange }: SystemPromptIDEProps) {
  const nt = NODE_TYPES[nodeType]
  const [showGenDrawer, setShowGenDrawer] = useState(false)
  const [showRefineBar, setShowRefineBar] = useState(false)
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const [diffOriginal, setDiffOriginal] = useState('')

  const monacoRef = useRef<unknown>(null)

  const handleEditorMount = useCallback((editor: unknown) => { monacoRef.current = editor }, [])

  function handleGenerate(text: string) {
    setDiffOriginal(systemPrompt)
    onPromptChange(text)
    setShowDiff(false)
  }

  async function handleRefine(instruction: string) {
    setRefining(true)
    setRefineError('')
    const prev = systemPrompt
    const text = await streamFetch(
      '/api/ai/prompt/refine',
      { currentPrompt: systemPrompt, instruction },
      chunk => onPromptChange(chunk),
      msg => setRefineError(msg),
    )
    if (text) {
      setDiffOriginal(prev)
      setShowRefineBar(false)
    }
    setRefining(false)
  }

  function toggleDiff() {
    if (!showDiff) setDiffOriginal(systemPrompt)
    setShowDiff(s => !s)
  }

  function copyPrompt() { if (systemPrompt) navigator.clipboard.writeText(systemPrompt) }

  const lineCount = systemPrompt.split('\n').length

  return (
    <div style={{ width: 640, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-1)', borderLeft: '1px solid var(--border)', flexShrink: 0, position: 'relative' }}>
      {/* Header */}
      <div className="af-panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: `color-mix(in srgb, ${nt?.color ?? 'var(--indigo)'} 15%, transparent)`, color: nt?.color ?? 'var(--indigo)', display: 'grid', placeItems: 'center' }}>
            <Icon name={nt?.icon ?? 'cpu'} size={11} sw={1.8} />
          </div>
          <span style={{ color: 'var(--text-3)' }}>{nodeName}</span>
          <span style={{ color: 'var(--text-4)' }}>—</span>
          <span>System Prompt</span>
        </div>
        <div className="af-badge af-badge-ai"><Icon name="sparkles" size={9} />AI</div>
      </div>

      {/* Tabs */}
      <div className="af-prop-tabs">
        <button className="af-prop-tab" onClick={() => onTabChange('config')}>Config</button>
        <button className="af-prop-tab is-active">Prompt IDE</button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <button className="af-btn af-btn-primary" style={{ fontSize: 11, height: 26, gap: 5 }} onClick={() => { setShowGenDrawer(true); setShowRefineBar(false); setShowDiff(false) }}>
          <Icon name="sparkles" size={11} />Generate
        </button>
        <button className="af-btn" style={{ fontSize: 11, height: 26, gap: 5, background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.3)', color: '#a78bfa' }}
          onClick={() => { setShowRefineBar(s => !s); setShowGenDrawer(false); setShowDiff(false) }}>
          <Icon name="wand" size={11} />Refine
        </button>
        {diffOriginal && (
          <button className="af-btn" style={{ fontSize: 11, height: 26, gap: 5, ...(showDiff ? { background: 'var(--surface-3)', borderColor: 'var(--border-strong)' } : {}) }}
            onClick={toggleDiff}>
            <Icon name="git-compare" size={11} />
            {showDiff ? 'Hide diff' : 'View diff'}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button className="af-btn af-btn-ghost" style={{ height: 26, padding: '4px 7px' }} onClick={copyPrompt} title="Copy">
          <Icon name="copy" size={12} />
        </button>
      </div>

      {showRefineBar && (
        <RefineBar onRefine={handleRefine} onClose={() => setShowRefineBar(false)} loading={refining} />
      )}
      {refineError && (
        <div style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', fontSize: 11.5, color: '#fca5a5' }}>{refineError}</div>
      )}

      {/* Editor area */}
      <div style={{ flex: '1 1 auto', overflow: 'hidden' }}>
        {showDiff ? (
          <MonacoDiffEditor
            height="100%"
            language="markdown"
            theme="vs-dark"
            original={diffOriginal}
            modified={systemPrompt}
            options={{ readOnly: false, fontSize: 13, wordWrap: 'on', minimap: { enabled: false }, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
            onMount={(_editor, monaco) => {
              // Allow editing the modified side and sync back
              const modifiedEditor = (_editor as { getModifiedEditor?: () => { onDidChangeModelContent: (cb: () => void) => void; getValue: () => string } }).getModifiedEditor?.()
              modifiedEditor?.onDidChangeModelContent(() => {
                onPromptChange(modifiedEditor.getValue())
              })
            }}
          />
        ) : (
          <MonacoEditor
            height="100%"
            language="markdown"
            theme="vs-dark"
            value={systemPrompt}
            onChange={v => onPromptChange(v ?? '')}
            onMount={handleEditorMount}
            options={{ fontSize: 13, lineHeight: 20, wordWrap: 'on', minimap: { enabled: false }, scrollBeyondLastLine: false, renderLineHighlight: 'gutter', padding: { top: 12, bottom: 12 }, fontFamily: 'JetBrains Mono, ui-monospace, monospace', tabSize: 2 }}
          />
        )}
      </div>

      {/* Status bar */}
      <div style={{ height: 22, background: '#007acc', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
        <span>Markdown</span>
        {showDiff && <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0 6px', borderRadius: 2 }}>Diff view</span>}
        <span style={{ marginLeft: 'auto' }}>{lineCount} lines</span>
        <span>UTF-8</span>
      </div>

      {showGenDrawer && (
        <GenerateDrawer
          nodeName={nodeName}
          onClose={() => setShowGenDrawer(false)}
          onResult={handleGenerate}
        />
      )}
    </div>
  )
}
