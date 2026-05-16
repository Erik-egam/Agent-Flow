'use client'

import { useState, useEffect } from 'react'
import Icon from './Icon'

interface SettingsPanelProps {
  onClose: () => void
}

interface ConfigStatus {
  provider: string
  model: string
  hasKey: boolean
}

const PROVIDER_DOCS: Record<string, { name: string; keyName: string; docs: string }> = {
  anthropic: { name: 'Anthropic', keyName: 'ANTHROPIC_API_KEY', docs: 'console.anthropic.com' },
  openai:    { name: 'OpenAI',    keyName: 'OPENAI_API_KEY',    docs: 'platform.openai.com' },
  groq:      { name: 'Groq',      keyName: 'GROQ_API_KEY',      docs: 'console.groq.com' },
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [config, setConfig] = useState<ConfigStatus | null>(null)

  useEffect(() => {
    fetch('/api/settings/status')
      .then(r => r.json())
      .then(d => setConfig(d as ConfigStatus))
      .catch(() => {})
  }, [])

  const providerInfo = PROVIDER_DOCS[config?.provider ?? 'anthropic']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-strong)', borderRadius: 12, width: 480, padding: 0, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
              <Icon name="settings" size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Settings</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>AI provider configuration</div>
            </div>
          </div>
          <button className="af-btn af-btn-ghost" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status card */}
          <div style={{ background: 'var(--surface-2)', border: `1px solid ${config?.hasKey ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: config?.hasKey ? 'var(--green)' : 'var(--amber)', boxShadow: config?.hasKey ? '0 0 6px var(--green)' : '0 0 6px var(--amber)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: config?.hasKey ? '#4ade80' : '#fbbf24' }}>
                {config?.hasKey ? 'API key configured' : 'API key not configured'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-3)' }}>
              <div><span style={{ color: 'var(--text-4)' }}>Provider: </span>{config?.provider ?? '—'}</div>
              <div><span style={{ color: 'var(--text-4)' }}>Model: </span><span style={{ fontFamily: 'var(--font-mono)' }}>{config?.model ?? '—'}</span></div>
            </div>
          </div>

          {/* How to configure */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 10 }}>How to configure</div>
            <div style={{ background: '#1e1e1e', borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#d4d4d4', lineHeight: 1.7 }}>
              <div style={{ color: '#6a9955' }}># .env.local in project root</div>
              <div><span style={{ color: '#9cdcfe' }}>AI_PROVIDER</span>=<span style={{ color: '#ce9178' }}>anthropic</span>  <span style={{ color: '#6a9955' }}># or openai / groq</span></div>
              <div><span style={{ color: '#9cdcfe' }}>AI_API_KEY</span>=<span style={{ color: '#ce9178' }}>sk-ant-…</span></div>
              <div><span style={{ color: '#9cdcfe' }}>AI_MODEL</span>=<span style={{ color: '#ce9178' }}>claude-sonnet-4-5</span>  <span style={{ color: '#6a9955' }}># optional</span></div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-3)' }}>
              After editing <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 3 }}>.env.local</code>, restart the dev server (<code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 3 }}>pnpm dev</code>).
            </div>
          </div>

          {/* Provider links */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 10 }}>Supported providers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(PROVIDER_DOCS).map(([key, info]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 6, border: `1px solid ${config?.provider === key ? 'var(--border-strong)' : 'transparent'}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: config?.provider === key ? 'var(--indigo)' : 'var(--border-strong)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1 }}>{info.name}</span>
                  <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}>{info.keyName}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{info.docs}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="af-btn af-btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
