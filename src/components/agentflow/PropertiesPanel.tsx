'use client'

import { useState } from 'react'
import Icon from './Icon'
import { NODE_TYPES } from './constants'
import SystemPromptIDE from './SystemPromptIDE'
import GenerateDrawer from './GenerateDrawer'

interface Chip {
  k: string
  v: string
}

interface NodeData {
  id: string
  type: string
  name: string
  chips: Chip[]
  x: number
  y: number
}

interface DelegationRuleProps {
  agent: string
  color: string
  priority: 'high' | 'normal' | 'low'
  when: string
}

function DelegationRule({ agent, color, priority, when }: DelegationRuleProps) {
  const priorityStyle = {
    high: { background: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
    normal: { background: 'rgba(99,102,241,0.15)', color: 'var(--indigo-2)' },
    low: { background: 'rgba(82,82,82,0.3)', color: 'var(--text-3)' },
  }[priority]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 7px',
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          borderRadius: 4,
          fontSize: 11,
          color,
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}
      >
        {agent}
      </div>
      <div className="af-badge" style={priorityStyle}>
        {priority}
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-3)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {when}
      </span>
    </div>
  )
}

interface PropertiesPanelProps {
  node: NodeData
  onClose: () => void
  activeTab: 'config' | 'prompt' | 'conn'
  onTabChange: (tab: 'config' | 'prompt' | 'conn') => void
  onShowGenerateDrawer: () => void
  showGenerateDrawer: boolean
  onCloseDrawer: () => void
}

const DELEGATION_RULES: DelegationRuleProps[] = [
  { agent: 'web_researcher', color: 'var(--c-agent)', priority: 'high', when: 'query contains URLs or "search"' },
  { agent: 'code_analyst', color: 'var(--c-agent)', priority: 'normal', when: 'query contains code or technical analysis' },
]

export default function PropertiesPanel({
  node,
  onClose,
  activeTab,
  onTabChange,
  onShowGenerateDrawer,
  showGenerateDrawer,
  onCloseDrawer,
}: PropertiesPanelProps) {
  const nodeType = NODE_TYPES[node.type]
  const color = nodeType?.color ?? 'var(--indigo)'
  const icon = nodeType?.icon ?? 'circle'

  const [temperature, setTemperature] = useState(0.7)

  if (activeTab === 'prompt') {
    return (
      <div style={{ display: 'flex', position: 'relative' }}>
        <SystemPromptIDE
          nodeName={node.name}
          nodeType={node.type}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onShowGenerateDrawer={onShowGenerateDrawer}
        />
        {showGenerateDrawer && (
          <GenerateDrawer onClose={onCloseDrawer} />
        )}
      </div>
    )
  }

  return (
    <div className="af-panel af-panel-right" style={{ width: 280, flexShrink: 0 }}>
      {/* Header */}
      <div className="af-panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              color,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name={icon} size={11} sw={1.8} />
          </div>
          <span>{nodeType?.label ?? node.type}</span>
        </div>
        <button
          className="af-btn af-btn-ghost"
          style={{ height: 24, padding: '3px 6px' }}
          onClick={onClose}
        >
          <Icon name="x" size={12} />
        </button>
      </div>

      {/* Tabs */}
      <div className="af-prop-tabs">
        {(['config', 'prompt', 'conn'] as const).map(tab => (
          <button
            key={tab}
            className={`af-prop-tab${activeTab === tab ? ' is-active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab === 'config' ? 'Config' : tab === 'prompt' ? 'Prompt' : 'Connections'}
          </button>
        ))}
      </div>

      {/* Config body */}
      <div className="af-prop-body">
        {/* Identity */}
        <div className="af-section">
          <div className="af-section-head">Identity</div>
          <div className="af-field">
            <label className="af-label">Name</label>
            <input className="af-input" defaultValue={node.name} />
          </div>
          <div className="af-field">
            <label className="af-label">Description</label>
            <textarea
              className="af-textarea"
              defaultValue="Routes research tasks to specialized sub-agents based on query type."
              style={{ minHeight: 54 }}
            />
          </div>
        </div>

        {/* Model */}
        <div className="af-section">
          <div className="af-section-head">Model</div>
          <div className="af-field">
            <label className="af-label">Provider</label>
            <select className="af-select" defaultValue="openai">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="groq">Groq</option>
            </select>
          </div>
          <div className="af-field">
            <label className="af-label">Model</label>
            <select className="af-select" defaultValue="gpt-4o">
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="claude-sonnet-4">claude-sonnet-4</option>
            </select>
          </div>
          <div className="af-field">
            <label className="af-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Temperature</span>
              <span style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{temperature.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--indigo)' }}
            />
          </div>
          <div className="af-field">
            <label className="af-label">Max tokens</label>
            <input className="af-input" defaultValue="4096" type="number" />
          </div>
        </div>

        {/* Delegation rules — shown for orchestrator type */}
        {node.type === 'orchestrator' && (
          <div className="af-section">
            <div className="af-section-head" style={{ justifyContent: 'space-between' }}>
              <span>Delegation Rules</span>
              <button className="af-btn af-btn-ghost" style={{ height: 20, padding: '2px 6px', fontSize: 10 }}>
                <Icon name="plus" size={10} />
              </button>
            </div>
            {DELEGATION_RULES.map((rule, i) => (
              <DelegationRule key={i} {...rule} />
            ))}
            <button
              className="af-btn"
              style={{ marginTop: 10, width: '100%', justifyContent: 'center', fontSize: 11, height: 26 }}
            >
              <Icon name="play" size={10} />
              Simulate routing
            </button>
          </div>
        )}

        {/* System prompt preview */}
        <div className="af-section">
          <div className="af-section-head" style={{ justifyContent: 'space-between' }}>
            <span>System Prompt</span>
            <div className="af-badge af-badge-ai">
              <Icon name="sparkles" size={9} />
              AI
            </div>
          </div>
          <div className="af-prompt-preview" onClick={() => onTabChange('prompt')}>
            <span className="tpl-var">{'{{agent_name}}'}</span>
            {', an intelligent orchestrator that routes research tasks to specialized sub-agents based on query type and complexity...'}
          </div>
          <div className="af-prompt-edit" onClick={() => onTabChange('prompt')}>
            <Icon name="edit" size={12} />
            <span>Open prompt IDE</span>
            <Icon name="chevron-right" size={10} />
          </div>
        </div>
      </div>
    </div>
  )
}
