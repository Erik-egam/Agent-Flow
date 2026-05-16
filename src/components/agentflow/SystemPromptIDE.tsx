'use client'

import Icon from './Icon'

interface SystemPromptIDEProps {
  nodeName?: string
  nodeType?: string
  activeTab: 'config' | 'prompt' | 'conn'
  onTabChange: (tab: 'config' | 'prompt' | 'conn') => void
  onShowGenerateDrawer?: () => void
}

// Syntax-highlighted prompt lines
const PROMPT_LINES: Array<{ segs: Array<{ text: string; color: string }> }> = [
  { segs: [{ text: '# Research Router System Prompt', color: '#6a9955' }] },
  { segs: [{ text: '', color: '' }] },
  { segs: [{ text: 'You are ', color: '#d4d4d4' }, { text: '{{agent_name}}', color: '#fbbf24' }, { text: ', an intelligent orchestrator', color: '#d4d4d4' }] },
  { segs: [{ text: 'that routes research tasks to specialized sub-agents.', color: '#d4d4d4' }] },
  { segs: [{ text: '', color: '' }] },
  { segs: [{ text: '## Context', color: '#569cd6' }] },
  { segs: [{ text: '- Session ID: ', color: '#d4d4d4' }, { text: '{{session_id}}', color: '#fbbf24' }] },
  { segs: [{ text: '- Available agents: ', color: '#d4d4d4' }, { text: '{{available_agents}}', color: '#fbbf24' }] },
  { segs: [{ text: '- Max parallel tasks: ', color: '#d4d4d4' }, { text: '{{max_parallel}}', color: '#fbbf24' }] },
  { segs: [{ text: '', color: '' }] },
  { segs: [{ text: '## Routing Rules', color: '#569cd6' }] },
  { segs: [{ text: '1. Analyze the user query carefully', color: '#d4d4d4' }] },
  { segs: [{ text: '2. Determine which agent(s) are best suited', color: '#d4d4d4' }] },
  { segs: [{ text: '3. For web content → route to Web Researcher', color: '#d4d4d4' }] },
  { segs: [{ text: '4. For code analysis → route to Code Analyst', color: '#d4d4d4' }] },
  { segs: [{ text: '5. Combine outputs coherently', color: '#d4d4d4' }] },
  { segs: [{ text: '', color: '' }] },
  { segs: [{ text: '## Output Format', color: '#569cd6' }] },
  { segs: [{ text: 'Return a JSON routing plan:', color: '#d4d4d4' }] },
  { segs: [{ text: '```json', color: '#808080' }] },
  { segs: [{ text: '{', color: '#ffd700' }] },
  { segs: [{ text: '  "route": ', color: '#9cdcfe' }, { text: '"web" | "code" | "both"', color: '#ce9178' }, { text: ',', color: '#d4d4d4' }] },
  { segs: [{ text: '  "reason": ', color: '#9cdcfe' }, { text: '"string"', color: '#ce9178' }, { text: ',', color: '#d4d4d4' }] },
  { segs: [{ text: '  "priority": ', color: '#9cdcfe' }, { text: '"high" | "normal"', color: '#ce9178' }] },
  { segs: [{ text: '}', color: '#ffd700' }] },
  { segs: [{ text: '```', color: '#808080' }] },
]

const TEMPLATE_VARS = ['{{agent_name}}', '{{session_id}}', '{{available_agents}}', '{{max_parallel}}']

export default function SystemPromptIDE({
  nodeName = 'Research Router',
  activeTab,
  onTabChange,
  onShowGenerateDrawer,
}: SystemPromptIDEProps) {
  return (
    <div
      style={{
        width: 640,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface-1)',
        borderLeft: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Panel header */}
      <div className="af-panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: 'color-mix(in srgb, var(--c-orchestrator) 15%, transparent)',
              color: 'var(--c-orchestrator)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="sitemap" size={11} sw={1.8} />
          </div>
          <span style={{ color: 'var(--text-3)' }}>{nodeName}</span>
          <span style={{ color: 'var(--text-4)' }}>—</span>
          <span>System Prompt</span>
        </div>
        <div className="af-badge af-badge-ai">
          <Icon name="sparkles" size={9} />
          AI
        </div>
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

      {/* IDE toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}
      >
        <button
          className="af-btn af-btn-primary"
          style={{ fontSize: 11, height: 26, gap: 5 }}
          onClick={onShowGenerateDrawer}
        >
          <Icon name="sparkles" size={11} />
          Generate
        </button>
        <button className="af-btn" style={{ fontSize: 11, height: 26, gap: 5, background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.3)', color: '#a78bfa' }}>
          <Icon name="wand" size={11} />
          Refine
        </button>
        <button className="af-btn" style={{ fontSize: 11, height: 26, gap: 5 }}>
          <Icon name="git-compare" size={11} />
          View diff
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="af-badge af-badge-ai">
            <Icon name="sparkles" size={9} />
            AI-generated
          </div>
          <button className="af-btn-ghost af-btn" style={{ height: 26, padding: '4px 7px' }}>
            <Icon name="copy" size={12} />
          </button>
          <button className="af-btn-ghost af-btn" style={{ height: 26, padding: '4px 7px' }}>
            <Icon name="maximize" size={12} />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          background: '#1e1e1e',
          borderBottom: '1px solid #333',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-3)',
        }}
      >
        <span>research-pipeline.json</span>
        <Icon name="chevron-right" size={10} />
        <span>nodes</span>
        <Icon name="chevron-right" size={10} />
        <span>Research Router</span>
        <Icon name="chevron-right" size={10} />
        <span style={{ color: 'var(--text-2)' }}>system_prompt</span>
      </div>

      {/* Code editor */}
      <div
        style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          background: '#1e1e1e',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: '1.6',
          padding: '12px 0',
        }}
      >
        {PROMPT_LINES.map((line, lineNum) => (
          <div
            key={lineNum}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              paddingRight: 24,
              minHeight: 19.2,
            }}
          >
            {/* Line number */}
            <span
              style={{
                width: 48,
                textAlign: 'right',
                paddingRight: 16,
                color: '#555',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              {lineNum + 1}
            </span>
            {/* Line content */}
            <span>
              {line.segs.length === 0 || (line.segs.length === 1 && line.segs[0].text === '') ? (
                ' '
              ) : (
                line.segs.map((seg, si) => (
                  <span key={si} style={{ color: seg.color || '#d4d4d4' }}>
                    {seg.text}
                  </span>
                ))
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Variable chips strip */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 10.5, color: 'var(--text-4)', marginRight: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Variables
        </span>
        {TEMPLATE_VARS.map(v => (
          <div
            key={v}
            className="af-chip"
            style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.08)' }}
          >
            {v}
          </div>
        ))}
        <button className="af-btn" style={{ marginLeft: 'auto', fontSize: 11, height: 24, gap: 4 }}>
          <Icon name="plus" size={10} />
          Add variable
        </button>
      </div>

      {/* VS Code-like status bar */}
      <div
        style={{
          height: 22,
          background: '#007acc',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 12,
          fontSize: 11,
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}
      >
        <span>Markdown</span>
        <span style={{ marginLeft: 'auto' }}>Ln 26, Col 1</span>
        <span>{PROMPT_LINES.length} lines</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
