'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Icon from './Icon'
import { useFlowStore, type FlowNodeData } from '@/store/useFlowStore'
import type { ExecutionEvent } from '@/lib/execution/types'

interface ExecutionDebuggerProps {
  onClose: () => void
}

interface HistoryRun {
  id: string
  status: string
  createdAt: string
  events: ExecutionEvent[]
}

const NODE_TYPE_COLOR: Record<string, string> = {
  input: 'var(--c-input)',
  output: 'var(--c-output)',
  agent: 'var(--c-agent)',
  tool: 'var(--c-tool)',
  orchestrator: 'var(--c-orchestrator)',
  memory: 'var(--c-memory)',
}

function elapsedMs(start: number) {
  const d = Date.now() - start
  return d < 1000 ? `${d}ms` : `${(d / 1000).toFixed(1)}s`
}

export default function ExecutionDebugger({ onClose }: ExecutionDebuggerProps) {
  const { nodes, edges, designId, setNodeStatus, setActiveEdges } = useFlowStore()

  const [inputText, setInputText] = useState('{\n  "query": ""\n}')
  const [activeTab, setActiveTab] = useState<'input' | 'history'>('input')
  const [events, setEvents] = useState<ExecutionEvent[]>([])
  const [runId, setRunId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [runStart, setRunStart] = useState(0)
  const [elapsed, setElapsed] = useState('0ms')
  const [nodeOutputs, setNodeOutputs] = useState<Record<string, string>>({})
  const [selectedOutput, setSelectedOutput] = useState<{ nodeId: string; name: string; output: string } | null>(null)
  const [history, setHistory] = useState<HistoryRun[]>([])
  const [state, setState] = useState<Record<string, unknown>>({})

  const eventsRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Fetch history when tab switches
  useEffect(() => {
    if (activeTab === 'history') {
      const url = designId ? `/api/execution/history?designId=${designId}&limit=10` : '/api/execution/history?limit=10'
      fetch(url).then(r => r.json()).then(d => setHistory(d as HistoryRun[])).catch(() => {})
    }
  }, [activeTab, designId])

  // Elapsed timer
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(elapsedMs(runStart)), 100)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, runStart])

  // Auto-scroll events
  useEffect(() => {
    if (eventsRef.current) eventsRef.current.scrollTop = eventsRef.current.scrollHeight
  }, [events])

  async function startRun() {
    if (running) return
    setEvents([])
    setNodeOutputs({})
    setState({})
    setRunning(true)
    setRunStart(Date.now())
    setElapsed('0ms')

    // Reset all node statuses
    nodes.forEach(n => setNodeStatus(n.id, 'idle'))
    setActiveEdges(new Set())

    const payload = {
      input: inputText,
      nodes: nodes.map(n => ({
        id: n.id,
        type: 'flowNode',
        name: (n.data as FlowNodeData).name,
        position: n.position,
        data: n.data as Record<string, unknown>,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === 'string' ? e.label : undefined,
      })),
      designId: designId ?? undefined,
    }

    try {
      const res = await fetch('/api/execution/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const { runId: id, error } = await res.json() as { runId?: string; error?: string }
      if (error || !id) { addEvent({ type: 'run_error', runId: '', error: error ?? 'Unknown error', timestamp: Date.now() }); setRunning(false); return }
      setRunId(id)
      connectSSE(id)
    } catch (err) {
      addEvent({ type: 'run_error', runId: '', error: String(err instanceof Error ? err.message : err), timestamp: Date.now() })
      setRunning(false)
    }
  }

  function addEvent(event: ExecutionEvent) {
    setEvents(prev => [...prev, event])

    // Update canvas based on event type
    if (event.nodeId) {
      if (event.type === 'node_start') {
        setNodeStatus(event.nodeId, 'run')
        // Animate incoming edges
        setActiveEdges(new Set(edges.filter(e => e.target === event.nodeId).map(e => e.id)))
      } else if (event.type === 'node_complete') {
        setNodeStatus(event.nodeId, 'ok')
        if (event.output) setNodeOutputs(prev => ({ ...prev, [event.nodeId!]: event.output! }))
        setState(prev => ({ ...prev, [event.nodeName ?? event.nodeId!]: event.output?.slice(0, 100) }))
      } else if (event.type === 'node_error') {
        setNodeStatus(event.nodeId, 'err')
      }
    }

    if (event.type === 'run_complete' || event.type === 'run_error') {
      setRunning(false)
      setActiveEdges(new Set())
    }
  }

  function connectSSE(id: string) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    fetch(`/api/execution/${id}/stream`, { signal: controller.signal })
      .then(async res => {
        if (!res.body) return
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const data = line.replace(/^data: /, '').trim()
            if (!data || data.startsWith(':')) continue
            try {
              const event = JSON.parse(data) as ExecutionEvent
              addEvent(event)
            } catch { /* ignore malformed */ }
          }
        }
      })
      .catch(err => {
        if (err instanceof Error && err.name !== 'AbortError') {
          addEvent({ type: 'run_error', runId: id, error: err.message, timestamp: Date.now() })
          setRunning(false)
        }
      })
  }

  function stopRun() {
    abortRef.current?.abort()
    setRunning(false)
    nodes.forEach(n => setNodeStatus(n.id, 'idle'))
    setActiveEdges(new Set())
    onClose()
  }

  const statusBadge = running
    ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--indigo-2)', fontFamily: 'var(--font-mono)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo)', animation: 'af-pulse 1.4s ease-in-out infinite' }} />
        running
      </div>
    : events.some(e => e.type === 'run_error' || e.type === 'node_error')
    ? <span className="af-badge af-badge-err">error</span>
    : events.some(e => e.type === 'run_complete')
    ? <span className="af-badge af-badge-ok">done</span>
    : null

  return (
    <>
      {/* Node output modal */}
      {selectedOutput && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }} onClick={() => setSelectedOutput(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-strong)', borderRadius: 10, width: 560, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedOutput.name} — Output</span>
              <button className="af-btn af-btn-ghost" style={{ height: 26 }} onClick={() => setSelectedOutput(null)}><Icon name="x" size={13} /></button>
            </div>
            <pre style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {selectedOutput.output}
            </pre>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%', background: 'var(--surface-1)', borderTop: '1px solid var(--border-strong)', display: 'flex', flexDirection: 'column', zIndex: 40, boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>
        {/* Drag handle */}
        <div style={{ height: 4, background: 'var(--border)', cursor: 'ns-resize', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 32, height: 2, background: 'var(--border-strong)', borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 38, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? 'var(--green)' : 'var(--text-4)', boxShadow: running ? '0 0 8px var(--green)' : 'none', animation: running ? 'af-pulse 1.4s ease-in-out infinite' : 'none' }} />
          <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text)' }}>{running ? 'Live Run' : 'Execution Debugger'}</span>
          {runId && (
            <>
              <div className="af-divider-v" />
              <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{runId}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{elapsed}</span>
            </>
          )}
          {statusBadge}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {running && (
              <button className="af-btn" style={{ height: 26, fontSize: 11, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', background: 'rgba(239,68,68,0.08)' }} onClick={stopRun}>
                <Icon name="square" size={10} />Stop
              </button>
            )}
            <button className="af-btn af-btn-ghost" style={{ height: 26, padding: '4px 7px' }} onClick={stopRun}>
              <Icon name="x" size={13} />
            </button>
          </div>
        </div>

        {/* Three columns */}
        <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
          {/* Column 1: Input + History */}
          <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {(['input', 'history'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '6px 10px', background: 'none', border: 'none', fontSize: 11, fontFamily: 'var(--font-ui)', cursor: 'pointer', color: activeTab === t ? 'var(--text)' : 'var(--text-3)', borderBottom: activeTab === t ? '1.5px solid var(--indigo)' : '1.5px solid transparent' }}>
                  {t === 'input' ? 'Input' : 'History'}
                </button>
              ))}
            </div>

            <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              {activeTab === 'input' ? (
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={running}
                  style={{ width: '100%', height: '100%', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-2)', padding: '10px 12px', background: 'transparent', border: 'none', resize: 'none', outline: 'none', lineHeight: 1.6 }}
                />
              ) : (
                <div style={{ padding: 8 }}>
                  {history.length === 0
                    ? <div style={{ padding: 16, fontSize: 12, color: 'var(--text-4)', textAlign: 'center' }}>No runs yet</div>
                    : history.map(run => (
                        <div key={run.id} style={{ padding: '7px 10px', borderRadius: 5, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                          onClick={() => setEvents(run.events)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: run.status === 'completed' ? 'var(--green)' : run.status === 'failed' ? 'var(--red)' : 'var(--amber)', flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.id}</span>
                          </div>
                          <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2, marginLeft: 12 }}>{new Date(run.createdAt).toLocaleTimeString()}</div>
                        </div>
                      ))
                  }
                </div>
              )}
            </div>

            <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)' }}>
              <button className="af-btn af-btn-run" style={{ width: '100%', justifyContent: 'center', height: 28, fontSize: 11.5 }} onClick={startRun} disabled={running}>
                <Icon name="play" size={11} />
                {running ? 'Running…' : 'Run with this input'}
              </button>
            </div>
          </div>

          {/* Column 2: Events log */}
          <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Events</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{events.length} events</span>
            </div>

            <div ref={eventsRef} style={{ flex: '1 1 auto', overflowY: 'auto', padding: '4px 0' }}>
              {events.length === 0 && !running && (
                <div style={{ padding: '20px 12px', fontSize: 12, color: 'var(--text-4)', textAlign: 'center' }}>Run the design to see events</div>
              )}
              {events.map((ev, i) => {
                const color = ev.nodeType ? (NODE_TYPE_COLOR[ev.nodeType] ?? 'var(--text-4)') : 'var(--text-4)'
                const isComplete = ev.type === 'node_complete'
                const hasOutput = isComplete && nodeOutputs[ev.nodeId ?? '']
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 12px', borderBottom: '1px solid var(--border)', cursor: hasOutput ? 'pointer' : 'default' }}
                    onClick={() => hasOutput && ev.nodeId && setSelectedOutput({ nodeId: ev.nodeId, name: ev.nodeName ?? ev.nodeId, output: nodeOutputs[ev.nodeId] ?? '' })}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', width: 40, flexShrink: 0, paddingTop: 2 }}>
                      {elapsedMs(runStart > 0 ? runStart : ev.timestamp)}
                    </span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.type === 'node_error' ? 'var(--red)' : ev.type === 'run_complete' ? 'var(--green)' : color, flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{ev.nodeName ?? ev.type}</span>
                        {hasOutput && <Icon name="chevron-right" size={10} />}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>
                        {ev.type === 'node_error' ? ev.error :
                         ev.type === 'node_stream' ? (ev.text?.slice(0, 80) ?? '') + '…' :
                         ev.type === 'run_complete' ? `Completed in ${ev.duration}ms — ${ev.totalTokens ?? 0} tokens` :
                         ev.type}
                      </div>
                    </div>
                    {ev.tokenCount && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-4)', flexShrink: 0 }}>{ev.tokenCount}t</span>}
                  </div>
                )
              })}
              {running && (
                <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo)', animation: 'af-pulse 1.4s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>Executing…</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: State inspector */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>State</span>
              <button className="af-btn af-btn-ghost" style={{ height: 20, padding: '2px 5px', fontSize: 10 }} onClick={() => navigator.clipboard.writeText(JSON.stringify(state, null, 2))}>
                <Icon name="copy" size={10} />
              </button>
            </div>
            <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', padding: '10px 12px', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(state, null, 2) || '{}'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
