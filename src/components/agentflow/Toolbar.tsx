'use client'

import Icon from './Icon'

interface ToolbarProps {
  name: string
  dirty?: boolean
  runState?: 'idle' | 'running'
  onRun?: () => void
  showRun?: boolean
}

export default function Toolbar({ name, dirty = false, runState = 'idle', onRun, showRun = true }: ToolbarProps) {
  return (
    <div className="af-toolbar">
      <div className="af-logo">
        <div className="af-logo-mark">AF</div>
        <span>AgentFlow</span>
      </div>

      <div className="af-divider-v" />

      <span className="af-crumb">Designs /</span>
      <span className="af-name">{name}</span>

      <div className="af-save">
        <div className="af-save-dot" style={dirty ? { background: 'var(--amber)', boxShadow: '0 0 6px rgba(245,158,11,0.6)' } : {}} />
        <span>{dirty ? 'Unsaved' : 'Saved'}</span>
      </div>

      <div className="af-tb-right">
        <button className="af-btn af-btn-ghost" title="Import">
          <Icon name="upload" size={13} />
        </button>
        <button className="af-btn af-btn-ghost" title="Export">
          <Icon name="download" size={13} />
        </button>
        <button className="af-btn af-btn-ghost" title="History">
          <Icon name="history" size={13} />
        </button>
        <div className="af-divider-v" />
        <button className="af-btn">
          <Icon name="git-compare" size={13} />
          <span>Version 1</span>
        </button>
        <button className="af-btn af-btn-primary">
          <Icon name="settings" size={13} />
          <span>Configure</span>
        </button>
        {showRun && (
          <button className="af-btn af-btn-run" onClick={onRun}>
            {runState === 'running' ? (
              <>
                <Icon name="square" size={11} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Icon name="play" size={11} />
                <span>Run</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
