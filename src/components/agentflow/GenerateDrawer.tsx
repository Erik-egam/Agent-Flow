'use client'

import { useState } from 'react'
import Icon from './Icon'

interface GenerateDrawerProps {
  onClose: () => void
}

const INITIAL_TAGS = ['deterministic routing', 'multi-agent', 'structured output']
const AVAILABLE_TOOLS = ['web_search', 'code_execute', 'memory_store', 'file_read']

export default function GenerateDrawer({ onClose }: GenerateDrawerProps) {
  const [tags, setTags] = useState<string[]>(INITIAL_TAGS)
  const [tagInput, setTagInput] = useState('')
  const [showFewShot, setShowFewShot] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t))
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 460,
        background: 'var(--surface-1)',
        borderLeft: '1px solid var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '16px 18px 14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--indigo-dim)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--indigo-2)',
              flexShrink: 0,
            }}
          >
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Generate System Prompt</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              Describe your agent and AI will write the optimal prompt
            </div>
          </div>
        </div>
        <button className="af-btn af-btn-ghost" onClick={onClose} style={{ height: 28, padding: '5px 8px' }}>
          <Icon name="x" size={14} />
        </button>
      </div>

      {/* Scrollable form */}
      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '16px 18px' }}>
        {/* Role */}
        <div className="af-field">
          <label className="af-label">Agent role *</label>
          <input
            className="af-input"
            placeholder="e.g. Research orchestrator that routes tasks to specialized agents"
            defaultValue="Intelligent orchestrator that routes research tasks to specialized sub-agents"
          />
        </div>

        {/* Context */}
        <div className="af-field">
          <label className="af-label">Context & background</label>
          <textarea
            className="af-textarea"
            style={{ minHeight: 80 }}
            placeholder="What does this agent know? What system is it part of?"
            defaultValue="Part of a research pipeline. Has access to Web Researcher and Code Analyst agents. Handles user queries about technical topics."
          />
        </div>

        {/* Constraints */}
        <div className="af-field">
          <label className="af-label">Constraints & behavior</label>
          <div
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-strong)',
              borderRadius: 6,
              padding: '6px 8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
              cursor: 'text',
            }}
          >
            {tags.map(t => (
              <div
                key={t}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 7px',
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontSize: 11.5,
                  color: 'var(--text-2)',
                }}
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-4)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="x" size={10} />
                </button>
              </div>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add constraint…"
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 11.5,
                color: 'var(--text)',
                fontFamily: 'var(--font-ui)',
                minWidth: 100,
              }}
            />
          </div>
        </div>

        {/* Output format */}
        <div className="af-field">
          <label className="af-label">Output format</label>
          <select className="af-select" defaultValue="json">
            <option value="json">JSON — structured routing plan</option>
            <option value="text">Plain text</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>

        {/* Available tools */}
        <div className="af-field">
          <label className="af-label">Available tools</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {AVAILABLE_TOOLS.map(tool => (
              <div key={tool} className="af-chip" style={{ fontFamily: 'var(--font-mono)', cursor: 'default' }}>
                <Icon name="wrench" size={10} />
                {tool}
              </div>
            ))}
          </div>
        </div>

        {/* Few-shot examples (collapsible) */}
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => setShowFewShot(s => !s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-3)',
              fontSize: 11.5,
              fontFamily: 'var(--font-ui)',
              padding: '4px 0',
            }}
          >
            <Icon name={showFewShot ? 'chevron-down' : 'chevron-right'} size={11} />
            <span>Few-shot examples</span>
            <span
              style={{
                marginLeft: 2,
                padding: '1px 5px',
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                fontSize: 10,
                color: 'var(--text-4)',
              }}
            >
              optional
            </span>
          </button>
          {showFewShot && (
            <div style={{ marginTop: 8 }}>
              <textarea
                className="af-textarea"
                style={{ minHeight: 80 }}
                placeholder={'User: "Find papers about LLMs"\nAssistant: { "route": "web", "reason": "Needs web search for academic papers" }'}
              />
              <button className="af-btn" style={{ marginTop: 6, fontSize: 11, height: 26 }}>
                <Icon name="plus" size={10} />
                Add example
              </button>
            </div>
          )}
        </div>

        {/* Advanced options (collapsible) */}
        <div>
          <button
            onClick={() => setShowAdvanced(s => !s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-3)',
              fontSize: 11.5,
              fontFamily: 'var(--font-ui)',
              padding: '4px 0',
            }}
          >
            <Icon name={showAdvanced ? 'chevron-down' : 'chevron-right'} size={11} />
            <span>Advanced options</span>
          </button>
          {showAdvanced && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="af-field" style={{ marginBottom: 0 }}>
                <label className="af-label">Writing style</label>
                <select className="af-select" defaultValue="precise">
                  <option value="precise">Precise & technical</option>
                  <option value="friendly">Friendly & conversational</option>
                  <option value="concise">Concise</option>
                </select>
              </div>
              <div className="af-field" style={{ marginBottom: 0 }}>
                <label className="af-label">Prompt length</label>
                <select className="af-select" defaultValue="medium">
                  <option value="short">Short (~200 tokens)</option>
                  <option value="medium">Medium (~500 tokens)</option>
                  <option value="long">Long (~1000+ tokens)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 18px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--text-4)',
            fontSize: 11,
            marginRight: 'auto',
          }}
        >
          <Icon name="sparkles" size={11} />
          <span style={{ fontFamily: 'var(--font-mono)' }}>claude-sonnet-4</span>
        </div>
        <button className="af-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="af-btn af-btn-primary" style={{ gap: 8 }}>
          <Icon name="sparkles" size={12} />
          <span>Generate prompt</span>
          <kbd className="af-kbd" style={{ marginLeft: 2 }}>⌘↵</kbd>
        </button>
      </div>
    </div>
  )
}
