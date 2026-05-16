'use client'

import { useEffect } from 'react'
import Icon from './Icon'

interface Props {
  onClose: () => void
}

const GROUPS = [
  {
    title: 'Canvas',
    shortcuts: [
      { keys: ['Delete'],         desc: 'Delete selected node or edge' },
      { keys: ['Ctrl', 'A'],      desc: 'Select all nodes' },
      { keys: ['Shift', 'drag'],  desc: 'Multi-select nodes' },
      { keys: ['Scroll'],         desc: 'Zoom in / out' },
      { keys: ['Space', 'drag'],  desc: 'Pan canvas' },
      { keys: ['Ctrl', '0'],      desc: 'Fit view' },
    ],
  },
  {
    title: 'Design',
    shortcuts: [
      { keys: ['Ctrl', 'Z'],      desc: 'Undo' },
      { keys: ['Ctrl', 'Y'],      desc: 'Redo' },
      { keys: ['Ctrl', 'S'],      desc: 'Save design' },
    ],
  },
  {
    title: 'Interface',
    shortcuts: [
      { keys: ['?'],              desc: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', 'Enter'],  desc: 'Run design (debugger)' },
      { keys: ['Escape'],         desc: 'Close panel / deselect' },
    ],
  },
]

function Kbd({ children }: { children: string }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 26, height: 22, padding: '0 6px',
      background: 'var(--surface-3)', border: '1px solid var(--border-strong)',
      borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)',
      color: 'var(--text-2)', letterSpacing: '0.02em',
      boxShadow: '0 1px 0 var(--border-strong)',
    }}>
      {children}
    </kbd>
  )
}

export default function KeyboardShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-strong)', borderRadius: 12, width: 520, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="keyboard" size={16} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Keyboard Shortcuts</span>
          </div>
          <button className="af-btn af-btn-ghost" style={{ height: 28, padding: '4px 8px' }} onClick={onClose}>
            <Icon name="x" size={13} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {GROUPS.map(group => (
            <div key={group.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.shortcuts.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{s.desc}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {s.keys.map((k, ki) => (
                        <span key={ki} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Kbd>{k}</Kbd>
                          {ki < s.keys.length - 1 && <span style={{ fontSize: 10, color: 'var(--text-4)' }}>+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 11.5, color: 'var(--text-4)' }}>
          Press <Kbd>?</Kbd> anywhere to open this panel · <Kbd>Esc</Kbd> to close
        </div>
      </div>
    </div>
  )
}
