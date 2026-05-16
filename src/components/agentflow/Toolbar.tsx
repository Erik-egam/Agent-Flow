'use client'

import Icon from './Icon'

interface ToolbarProps {
  name: string
  dirty?: boolean
  saving?: boolean
  runState?: 'idle' | 'running'
  onRun?: () => void
  onSave?: () => void
  onExport?: () => void
  onImport?: () => void
  onSettings?: () => void
  onNew?: () => void
  onNameChange?: (name: string) => void
  showRun?: boolean
}

export default function Toolbar({
  name,
  dirty = false,
  saving = false,
  runState = 'idle',
  onRun,
  onSave,
  onExport,
  onImport,
  onSettings,
  onNew,
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

      <span className="af-crumb">
        <a href="/designs" style={{ color: 'inherit', textDecoration: 'none' }}>Designs</a> /
      </span>

      {onNameChange ? (
        <input
          className="af-name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          style={{ background: 'transparent', border: '1px solid transparent', outline: 'none', cursor: 'text' }}
          onBlur={e => { if (!e.target.value.trim()) onNameChange('Untitled design') }}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        />
      ) : (
        <span className="af-name">{name}</span>
      )}

      {/* Save button / status */}
      {onSave && (
        <button
          className="af-btn"
          onClick={onSave}
          disabled={saving}
          style={{
            height: 26,
            fontSize: 11.5,
            gap: 6,
            background: saving ? 'transparent' : dirty ? 'rgba(99,102,241,0.12)' : 'transparent',
            borderColor: dirty ? 'rgba(99,102,241,0.35)' : 'transparent',
            color: saving ? 'var(--text-4)' : dirty ? 'var(--indigo-2)' : 'var(--text-4)',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: saving ? 'var(--amber)' : dirty ? 'var(--indigo)' : 'var(--green)',
              boxShadow: saving
                ? '0 0 6px rgba(245,158,11,0.6)'
                : dirty
                ? '0 0 6px rgba(99,102,241,0.5)'
                : '0 0 4px rgba(34,197,94,0.4)',
              animation: saving ? 'af-pulse 1s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }}
          />
          <span>{saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}</span>
        </button>
      )}

      <div className="af-tb-right">
        {onNew && (
          <button className="af-btn af-btn-ghost" title="New design" onClick={onNew}>
            <Icon name="plus" size={13} />
            <span>New</span>
          </button>
        )}
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
          <button className="af-btn af-btn-ghost" onClick={onSettings} title="Settings">
            <Icon name="settings" size={13} />
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
