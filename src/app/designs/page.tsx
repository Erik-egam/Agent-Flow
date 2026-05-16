'use client'

import { useState } from 'react'
import Toolbar from '@/components/agentflow/Toolbar'
import Icon from '@/components/agentflow/Icon'

interface Design {
  id: string
  name: string
  description: string
  framework: string
  frameworkColor: string
  nodes: number
  lastEdited: string
  thumb: 'router' | 'fan' | 'linear' | 'cycle' | 'wide' | 'parallel'
}

const DESIGNS: Design[] = [
  {
    id: 'd1',
    name: 'Science research pipeline',
    description: 'Multi-agent system for routing research tasks to specialized sub-agents',
    framework: 'LangGraph',
    frameworkColor: '#22c55e',
    nodes: 7,
    lastEdited: '2h ago',
    thumb: 'router',
  },
  {
    id: 'd2',
    name: 'Customer support bot',
    description: 'Handles tier-1 support with escalation to human agents when needed',
    framework: 'LangChain',
    frameworkColor: '#3b82f6',
    nodes: 5,
    lastEdited: 'Yesterday',
    thumb: 'fan',
  },
  {
    id: 'd3',
    name: 'Code review assistant',
    description: 'Analyzes PRs, runs static analysis tools, and posts structured feedback',
    framework: 'AutoGen',
    frameworkColor: '#a855f7',
    nodes: 9,
    lastEdited: '3 days ago',
    thumb: 'linear',
  },
  {
    id: 'd4',
    name: 'Data pipeline orchestrator',
    description: 'ETL pipeline with LLM-powered data cleaning and transformation',
    framework: 'LangGraph',
    frameworkColor: '#22c55e',
    nodes: 12,
    lastEdited: '1 week ago',
    thumb: 'cycle',
  },
  {
    id: 'd5',
    name: 'Content creation workflow',
    description: 'Generates, refines, and publishes blog posts using specialized writer agents',
    framework: 'CrewAI',
    frameworkColor: '#f59e0b',
    nodes: 6,
    lastEdited: '2 weeks ago',
    thumb: 'wide',
  },
  {
    id: 'd6',
    name: 'Financial analysis agent',
    description: 'Fetches market data, runs analysis, and generates investment reports',
    framework: 'LangChain',
    frameworkColor: '#3b82f6',
    nodes: 8,
    lastEdited: '3 weeks ago',
    thumb: 'parallel',
  },
]

const FRAMEWORKS = ['All frameworks', 'LangGraph', 'LangChain', 'AutoGen', 'CrewAI']

type ThumbVariant = 'router' | 'fan' | 'linear' | 'cycle' | 'wide' | 'parallel'

function Thumb({ variant }: { variant: ThumbVariant }) {
  const nodeColor = 'rgba(99,102,241,0.7)'
  const edgeColor = 'rgba(255,255,255,0.2)'
  const nodeRect = (x: number, y: number, w = 48, h = 20, color = nodeColor) => (
    <rect x={x} y={y} width={w} height={h} rx={4} fill={color} />
  )
  const line = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={edgeColor} strokeWidth={1.5} />
  )

  const variants: Record<ThumbVariant, React.ReactNode> = {
    router: (
      <>
        {nodeRect(10, 55, 48, 20, 'rgba(59,130,246,0.7)')}
        {nodeRect(80, 55, 56, 20, 'rgba(245,158,11,0.7)')}
        {nodeRect(160, 20, 50, 20)}
        {nodeRect(160, 90, 50, 20)}
        {nodeRect(232, 55, 48, 20, 'rgba(168,85,247,0.7)')}
        {line(58, 65, 80, 65)}
        {line(136, 65, 160, 30)}
        {line(136, 65, 160, 100)}
        {line(210, 30, 232, 65)}
        {line(210, 100, 232, 65)}
      </>
    ),
    fan: (
      <>
        {nodeRect(10, 55, 50, 20)}
        {nodeRect(90, 15, 50, 20, 'rgba(245,158,11,0.7)')}
        {nodeRect(90, 55, 50, 20, 'rgba(245,158,11,0.7)')}
        {nodeRect(90, 95, 50, 20, 'rgba(245,158,11,0.7)')}
        {nodeRect(172, 55, 50, 20, 'rgba(34,197,94,0.7)')}
        {line(60, 65, 90, 25)}
        {line(60, 65, 90, 65)}
        {line(60, 65, 90, 105)}
        {line(140, 25, 172, 65)}
        {line(140, 65, 172, 65)}
        {line(140, 105, 172, 65)}
        {nodeRect(244, 55, 46, 20, 'rgba(168,85,247,0.7)')}
        {line(222, 65, 244, 65)}
      </>
    ),
    linear: (
      <>
        {nodeRect(10, 55, 46, 20, 'rgba(59,130,246,0.7)')}
        {nodeRect(80, 55, 46, 20)}
        {nodeRect(150, 55, 46, 20)}
        {nodeRect(220, 55, 46, 20)}
        {nodeRect(150, 95, 46, 14, 'rgba(249,115,22,0.6)')}
        {line(56, 65, 80, 65)}
        {line(126, 65, 150, 65)}
        {line(196, 65, 220, 65)}
        {line(173, 75, 173, 95)}
      </>
    ),
    cycle: (
      <>
        {nodeRect(100, 10, 90, 22)}
        {nodeRect(190, 60, 80, 22)}
        {nodeRect(100, 110, 90, 22)}
        {nodeRect(10, 60, 80, 22, 'rgba(245,158,11,0.7)')}
        {line(145, 32, 230, 60)}
        {line(230, 82, 145, 110)}
        {line(100, 121, 50, 82)}
        {line(50, 60, 100, 21)}
      </>
    ),
    wide: (
      <>
        {nodeRect(5, 55, 52, 20, 'rgba(59,130,246,0.7)')}
        {nodeRect(78, 15, 52, 18)}
        {nodeRect(78, 50, 52, 18)}
        {nodeRect(78, 85, 52, 18)}
        {nodeRect(154, 30, 52, 18, 'rgba(249,115,22,0.6)')}
        {nodeRect(154, 70, 52, 18, 'rgba(20,184,166,0.7)')}
        {nodeRect(228, 50, 52, 20, 'rgba(168,85,247,0.7)')}
        {line(57, 65, 78, 24)}
        {line(57, 65, 78, 59)}
        {line(57, 65, 78, 94)}
        {line(130, 24, 154, 39)}
        {line(130, 59, 154, 79)}
        {line(130, 94, 154, 79)}
        {line(206, 39, 228, 60)}
        {line(206, 79, 228, 60)}
      </>
    ),
    parallel: (
      <>
        {nodeRect(10, 55, 50, 20)}
        {nodeRect(85, 20, 50, 18)}
        {nodeRect(85, 55, 50, 18)}
        {nodeRect(85, 90, 50, 18)}
        {nodeRect(160, 20, 50, 18, 'rgba(249,115,22,0.6)')}
        {nodeRect(160, 55, 50, 18, 'rgba(249,115,22,0.6)')}
        {nodeRect(160, 90, 50, 18, 'rgba(249,115,22,0.6)')}
        {nodeRect(232, 55, 50, 20, 'rgba(168,85,247,0.7)')}
        {line(60, 65, 85, 29)}
        {line(60, 65, 85, 64)}
        {line(60, 65, 85, 99)}
        {line(135, 29, 160, 29)}
        {line(135, 64, 160, 64)}
        {line(135, 99, 160, 99)}
        {line(210, 29, 232, 65)}
        {line(210, 64, 232, 65)}
        {line(210, 99, 232, 65)}
      </>
    ),
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 290 140"
      style={{ display: 'block' }}
    >
      {variants[variant]}
    </svg>
  )
}

interface DesignCardProps {
  design: Design
  onEdit: (id: string) => void
}

function DesignCard({ design, onEdit }: DesignCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        position: 'relative',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: 140,
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <Thumb variant={design.thumb} />

        {/* Hover overlay */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10,10,10,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <button
              className="af-btn af-btn-primary"
              style={{ fontSize: 12, height: 30 }}
              onClick={() => onEdit(design.id)}
            >
              <Icon name="edit" size={12} />
              Edit
            </button>
            <button
              className="af-btn af-btn-run"
              style={{ fontSize: 12, height: 30 }}
            >
              <Icon name="play" size={11} />
              Run
            </button>
            <button
              className="af-btn"
              style={{ fontSize: 12, height: 30, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              <Icon name="trash" size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Card info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>
            {design.name}
          </span>
          <button className="af-btn af-btn-ghost" style={{ height: 22, padding: '3px 5px', flexShrink: 0, marginLeft: 6 }}>
            <Icon name="more" size={13} />
          </button>
        </div>
        <p
          style={{
            fontSize: 11.5,
            color: 'var(--text-3)',
            lineHeight: 1.45,
            marginBottom: 10,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {design.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 7px',
              background: `color-mix(in srgb, ${design.frameworkColor} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${design.frameworkColor} 25%, transparent)`,
              borderRadius: 4,
              fontSize: 10.5,
              fontWeight: 600,
              color: design.frameworkColor,
              letterSpacing: '0.02em',
            }}
          >
            {design.framework}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
            {design.nodes} nodes
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 'auto' }}>
            {design.lastEdited}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function DesignsPage() {
  const [search, setSearch] = useState('')
  const [selectedFramework, setSelectedFramework] = useState('All frameworks')
  const [sortBy, setSortBy] = useState('Recent')

  const filtered = DESIGNS.filter(d => {
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
    const matchesFramework =
      selectedFramework === 'All frameworks' || d.framework === selectedFramework
    return matchesSearch && matchesFramework
  })

  function openEditor(id: string) {
    window.location.href = '/editor'
  }

  return (
    <div className="af-screen">
      <Toolbar name="Designs" showRun={false} />
      <div className="af-body">
        {/* Left sidebar */}
        <div className="af-panel" style={{ width: 220, flexShrink: 0 }}>
          <div className="af-panel-header">Library</div>

          {/* Nav items */}
          <div style={{ padding: '8px 6px' }}>
            {[
              { icon: 'layers', label: 'All designs', active: true, count: DESIGNS.length },
              { icon: 'star', label: 'Starred', active: false, count: 2 },
              { icon: 'history', label: 'Recent', active: false, count: null },
              { icon: 'folder', label: 'Shared with me', active: false, count: null },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: item.active ? 'var(--surface-2)' : 'transparent',
                  color: item.active ? 'var(--text)' : 'var(--text-3)',
                  fontSize: 12.5,
                  marginBottom: 2,
                }}
              >
                <Icon name={item.icon} size={13} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== null && (
                  <span
                    style={{
                      fontSize: 10.5,
                      color: item.active ? 'var(--text-2)' : 'var(--text-4)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              margin: '8px 12px',
              height: 1,
              background: 'var(--border)',
            }}
          />

          {/* Framework filters */}
          <div style={{ padding: '4px 6px' }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-4)',
                padding: '6px 10px 8px',
              }}
            >
              Framework
            </div>
            {FRAMEWORKS.map(fw => (
              <div
                key={fw}
                onClick={() => setSelectedFramework(fw)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: selectedFramework === fw ? 'var(--surface-2)' : 'transparent',
                  color: selectedFramework === fw ? 'var(--text)' : 'var(--text-3)',
                  fontSize: 12,
                  marginBottom: 1,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background:
                      fw === 'LangGraph'
                        ? '#22c55e'
                        : fw === 'LangChain'
                        ? '#3b82f6'
                        : fw === 'AutoGen'
                        ? '#a855f7'
                        : fw === 'CrewAI'
                        ? '#f59e0b'
                        : 'var(--border-strong)',
                    flexShrink: 0,
                  }}
                />
                {fw}
              </div>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Page header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px 14px',
            }}
          >
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                All Designs
              </h1>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                {DESIGNS.length} agent systems
              </p>
            </div>
            <button className="af-btn af-btn-primary" style={{ height: 32, fontSize: 12.5 }} onClick={() => openEditor('')}>
              <Icon name="plus" size={13} />
              New design
            </button>
          </div>

          {/* Search + sort strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 24px 16px',
            }}
          >
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 9,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-4)',
                  pointerEvents: 'none',
                }}
              >
                <Icon name="search" size={13} />
              </div>
              <input
                className="af-search"
                style={{ paddingLeft: 28, height: 32 }}
                placeholder="Search designs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-4)' }}>Sort by</span>
              {['Recent', 'Name', 'Nodes'].map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className="af-btn"
                  style={{
                    height: 28,
                    fontSize: 11.5,
                    background: sortBy === s ? 'var(--surface-2)' : 'transparent',
                    borderColor: sortBy === s ? 'var(--border-strong)' : 'transparent',
                    color: sortBy === s ? 'var(--text)' : 'var(--text-3)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div
            style={{
              padding: '0 24px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {filtered.map(design => (
              <DesignCard key={design.id} design={design} onEdit={openEditor} />
            ))}

            {/* Create new dashed card */}
            <div
              onClick={() => openEditor('')}
              style={{
                border: '1.5px dashed var(--border-strong)',
                borderRadius: 10,
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                color: 'var(--text-4)',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--indigo)'
                el.style.color = 'var(--indigo-2)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--border-strong)'
                el.style.color = 'var(--text-4)'
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1.5px dashed currentColor',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name="plus" size={18} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>Create new design</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
