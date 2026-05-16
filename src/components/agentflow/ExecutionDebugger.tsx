'use client'

import { useState } from 'react'
import Icon from './Icon'

interface ExecutionDebuggerProps {
  onClose: () => void
}

interface EventRow {
  time: string
  type: 'orchestrator' | 'agent' | 'tool' | 'state' | 'output'
  label: string
  detail: string
  tokens?: number
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  orchestrator: 'var(--c-orchestrator)',
  agent: 'var(--c-agent)',
  tool: 'var(--c-tool)',
  state: 'var(--c-state)',
  output: 'var(--c-output)',
}

const EVENTS: EventRow[] = [
  { time: '0ms',   type: 'orchestrator', label: 'router.start',      detail: 'Research Router invoked' },
  { time: '12ms',  type: 'orchestrator', label: 'routing.decision',   detail: 'route=web, priority=high', tokens: 143 },
  { time: '28ms',  type: 'agent',        label: 'web_researcher.start', detail: 'Web Researcher invoked' },
  { time: '44ms',  type: 'tool',         label: 'web_search.call',    detail: 'query="quantum computing 2025"' },
  { time: '1.2s',  type: 'tool',         label: 'web_search.result',  detail: '8 results, 3,412 chars' },
  { time: '1.4s',  type: 'state',        label: 'memory.store',       detail: 'Episodic store updated (k=12)' },
  { time: '2.1s',  type: 'agent',        label: 'web_researcher.done', detail: 'Research complete', tokens: 891 },
  { time: '2.3s',  type: 'output',       label: 'final_answer.start', detail: 'Synthesizing response' },
]

const TOKEN_STREAM = [
  'Quantum', ' computing', ' in', ' 2025', ' has', ' seen', ' remarkable',
  ' advances', ' in', ' error', ' correction', '...', ' Researchers', ' at',
  ' Google', ' and', ' IBM', ' have',
]

const INPUT_JSON = `{
  "query": "What are the latest advances in quantum computing?",
  "session_id": "sess_xK92mP",
  "max_tokens": 4096,
  "metadata": {
    "user_id": "usr_001",
    "timestamp": "2025-05-15T14:32:00Z"
  }
}`

const STATE_JSON = `{
  "current_node": "web_researcher",
  "route": "web",
  "priority": "high",
  "results": {
    "web_search": {
      "hits": 8,
      "chars": 3412
    }
  },
  "memory": {
    "k": 12,
    "backend": "sqlite"
  }
}`

export default function ExecutionDebugger({ onClose }: ExecutionDebuggerProps) {
  const [elapsed] = useState('2.3s')
  const [activeInput, setActiveInput] = useState<'editor' | 'fixtures'>('editor')

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '46%',
        background: 'var(--surface-1)',
        borderTop: '1px solid var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Drag handle */}
      <div
        style={{
          height: 4,
          background: 'var(--border)',
          cursor: 'ns-resize',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 32, height: 2, background: 'var(--border-strong)', borderRadius: 2 }} />
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          height: 38,
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {/* Animated pulse dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 8px var(--green)',
            animation: 'af-pulse 1.4s ease-in-out infinite',
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text)' }}>Live Run</span>

        <div className="af-divider-v" />

        <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
          run_xK92mP
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          {elapsed}
        </span>

        <div className="af-badge af-badge-ok">
          <Icon name="check" size={9} sw={2.5} />
          routing
        </div>
        <div className="af-badge" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--indigo-2)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo)', animation: 'af-pulse 1.4s ease-in-out infinite' }} />
          researching
        </div>
        <div className="af-badge af-badge-warn">2.3s</div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            className="af-btn"
            style={{ height: 26, fontSize: 11, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', background: 'rgba(239,68,68,0.08)' }}
            onClick={onClose}
          >
            <Icon name="square" size={10} />
            Stop
          </button>
          <button className="af-btn af-btn-ghost" style={{ height: 26, padding: '4px 7px' }} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>
      </div>

      {/* Three columns */}
      <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
        {/* Column 1: Input */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Sub-header tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
            }}
          >
            <button
              onClick={() => setActiveInput('editor')}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: 'none',
                border: 'none',
                fontSize: 11,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                color: activeInput === 'editor' ? 'var(--text)' : 'var(--text-3)',
                borderBottom: activeInput === 'editor' ? '1.5px solid var(--indigo)' : '1.5px solid transparent',
              }}
            >
              Input Editor
            </button>
            <button
              onClick={() => setActiveInput('fixtures')}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: 'none',
                border: 'none',
                fontSize: 11,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                color: activeInput === 'fixtures' ? 'var(--text)' : 'var(--text-3)',
                borderBottom: activeInput === 'fixtures' ? '1.5px solid var(--indigo)' : '1.5px solid transparent',
              }}
            >
              Saved Fixtures
            </button>
          </div>

          <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
            {activeInput === 'editor' ? (
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  color: 'var(--text-2)',
                  padding: '10px 12px',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {INPUT_JSON}
              </pre>
            ) : (
              <div style={{ padding: 12 }}>
                {['Basic query', 'Complex multi-topic', 'Code analysis'].map(name => (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      borderRadius: 5,
                      cursor: 'pointer',
                      color: 'var(--text-2)',
                      fontSize: 12,
                    }}
                  >
                    <Icon name="folder" size={12} />
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)' }}>
            <button className="af-btn af-btn-run" style={{ width: '100%', justifyContent: 'center', height: 28, fontSize: 11.5 }}>
              <Icon name="play" size={11} />
              Run with this input
            </button>
          </div>
        </div>

        {/* Column 2: Events log */}
        <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '6px 12px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Events</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{EVENTS.length} events</span>
          </div>

          <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '6px 0' }}>
            {EVENTS.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '5px 12px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-4)',
                    width: 36,
                    flexShrink: 0,
                    paddingTop: 1,
                  }}
                >
                  {ev.time}
                </span>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: EVENT_TYPE_COLORS[ev.type] ?? 'var(--text-4)',
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-2)' }}>
                    {ev.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>{ev.detail}</div>
                </div>
                {ev.tokens && (
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-4)',
                      flexShrink: 0,
                    }}
                  >
                    {ev.tokens}t
                  </span>
                )}
              </div>
            ))}

            {/* Token stream row */}
            <div
              style={{
                padding: '8px 12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                color: 'var(--text-2)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-4)', fontSize: 10, width: '100%', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                Token stream
              </span>
              {TOKEN_STREAM.map((tok, i) => (
                <span key={i} style={{ color: i === TOKEN_STREAM.length - 1 ? 'var(--indigo-2)' : 'var(--text-2)' }}>
                  {tok}
                </span>
              ))}
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 14,
                  background: 'var(--indigo)',
                  marginLeft: 1,
                  animation: 'af-blink 1s step-end infinite',
                  verticalAlign: 'text-bottom',
                }}
              />
            </div>
          </div>
        </div>

        {/* Column 3: State inspector */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '6px 12px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>State Inspector</span>
            <button className="af-btn af-btn-ghost" style={{ height: 20, padding: '2px 5px', fontSize: 10 }}>
              <Icon name="copy" size={10} />
            </button>
          </div>
          <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-2)',
                padding: '10px 12px',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {STATE_JSON}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
