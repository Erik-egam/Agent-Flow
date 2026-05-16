'use client'

import Icon from './Icon'

interface ToolbarProps {
  name: string
  dirty?: boolean
  saving?: boolean
  runState?: 'idle' | 'running'
  onRun?: () => void
  onExport?: () => void
  onImport?: () => void
  onSettings?: () => void
  onNameChange?: (name: string) => void
  showRun?: boolean
}

export default function Toolbar({
  name,
  dirty = false,
  saving = false,
  runState = 'idle',
  onRun,
  onExport,
  onImport,
  onSettings,
  onNameChange,
  showRun = true,
}: ToolbarProps) {
  return (
    <div className="af-toolbar">
      <a className="af-logo" href="/designs" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="af-logo-mark">AF</div>
        <span>AgentFlow</span>
      </a>

      <div className="af-divider-v" />

      <span className="af-crumb"><a href="/designs" style={{ color: 'inherit', textDecoration: 'none' }}>Designs</a> /</span>

      {onNameChange ? (
        <input
          className="af-name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          style={{ background: 'transparent', border: '1px solid transparent', outline: 'none', cursor: 'text' }}
          onBlur={e => { if (!e.target.value.trim()) onNameChange('Untitled design') }}
        />
      ) : (
        <span className="af-name">{name}</span>
      )}

      <div className="af-save">
        <div
          className="af-save-dot"
          style={
            saving
              ? { background: 'var(--amber)', boxShadow: '0 0 6px rgba(245,158,11,0.6)', animation: 'af-pulse 1s ease-in-out infinite' }
              : dirty
              ? { background: 'var(--amber)', boxShadow: '0 0 6px rgba(245,158,11,0.4)' }
              : {}
          }
        />
        <span style={{ color: saving ? 'var(--amber)' : dirty ? 'var(--text-3)' : 'var(--text-3)' }}>
          {saving ? 'Saving…' : dirty ? 'Unsaved' : 'Saved'}
        </span>
      </div>

      <div className="af-tb-right">
        {onImport && (
          <button className="af-btn af-btn-ghost" title="Import .agentflow.json" onClick={onImport}>
            <Icon name="upload" size={13} />
          </button>
        )}
        {onExport && (
          <button className="af-btn af-btn-ghost" title="Export .agentflow.json" onClick={onExport}>
            <Icon name="download" size={13} />
          </button>
        )}
        {onSettings && (
          <button className="af-btn" onClick={onSettings} title="Settings">
            <Icon name="settings" size={13} />
            <span>Settings</span>
          </button>
        )}
        <div className="af-divider-v" />
        {showRun && (
          <button className="af-btn af-btn-run" onClick={onRun}>
            {runState === 'running' ? (
              <><Icon name="square" size={11} /><span>Stop</span></>
            ) : (
              <><Icon name="play" size={11} /><span>Run</span></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
