'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Toolbar from '@/components/agentflow/Toolbar'
import Icon from '@/components/agentflow/Icon'
import { useFlowStore } from '@/store/useFlowStore'
import { deserialize, validateDesign } from '@/lib/schema/serialize'

interface DesignSummary {
  id: string
  name: string
  description: string
  framework: string
  nodeCount: number
  updatedAt: string
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

const FRAMEWORK_COLORS: Record<string, string> = {
  langgraph: '#22c55e',
  langchain: '#3b82f6',
  autogen: '#a855f7',
  crewai: '#f59e0b',
}

function DesignCard({ design, onOpen, onDelete }: { design: DesignSummary; onOpen: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  const color = FRAMEWORK_COLORS[design.framework?.toLowerCase()] ?? 'var(--indigo)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: 'var(--surface-1)', border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s', boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)', position: 'relative' }}
    >
      {/* Thumbnail area */}
      <div style={{ height: 120, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div style={{ fontSize: 32, opacity: 0.15 }}>⬡</div>
        <div style={{ position: 'absolute', bottom: 8, right: 10, display: 'flex', gap: 4 }}>
          {Array.from({ length: Math.min(design.nodeCount || 3, 8) }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: color, opacity: 0.4 + i * 0.07 }} />
          ))}
        </div>
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <button className="af-btn af-btn-primary" style={{ fontSize: 12, height: 30 }} onClick={e => { e.stopPropagation(); onOpen() }}>
              <Icon name="edit" size={12} />Edit
            </button>
            <button className="af-btn" style={{ fontSize: 12, height: 30, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}
              onClick={e => { e.stopPropagation(); onDelete() }}>
              <Icon name="trash" size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }} onClick={onOpen}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>{design.name}</span>
        </div>
        {design.description && (
          <p style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.45, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {design.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`, borderRadius: 4, fontSize: 10.5, fontWeight: 600, color, letterSpacing: '0.02em' }}>
            {design.framework ?? 'langgraph'}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{design.nodeCount} nodes</span>
          <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 'auto' }}>{timeAgo(design.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default function DesignsPage() {
  const router = useRouter()
  const { loadDesign } = useFlowStore()
  const [designs, setDesigns] = useState<DesignSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchDesigns = useCallback(async () => {
    try {
      const res = await fetch('/api/designs')
      const data = await res.json() as DesignSummary[]
      setDesigns(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDesigns() }, [fetchDesigns])

  async function openDesign(id: string) {
    const res = await fetch(`/api/designs/${id}`)
    const raw = await res.json() as unknown
    const validation = validateDesign(raw)
    if (!validation.success) { alert(`Cannot open: ${validation.error}`); return }
    const { nodes, edges } = deserialize(validation.data)
    loadDesign(nodes, edges, validation.data.id, validation.data.name)
    router.push('/editor')
  }

  async function deleteDesign(id: string) {
    if (!confirm('Delete this design? This cannot be undone.')) return
    await fetch(`/api/designs/${id}`, { method: 'DELETE' })
    setDesigns(prev => prev.filter(d => d.id !== id))
  }

  function newDesign() {
    router.push('/editor')
  }

  const filtered = designs.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="af-screen">
      <Toolbar name="Designs" showRun={false} />
      <div className="af-body">
        {/* Sidebar */}
        <div className="af-panel" style={{ width: 200, flexShrink: 0 }}>
          <div className="af-panel-header">Library</div>
          <div style={{ padding: '8px 6px' }}>
            {[{ icon: 'layers', label: 'All designs', count: designs.length }].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 12.5, marginBottom: 2 }}>
                <Icon name={item.icon} size={13} />
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px' }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>All Designs</h1>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{designs.length} agent system{designs.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="af-btn af-btn-primary" style={{ height: 32, fontSize: 12.5 }} onClick={newDesign}>
              <Icon name="plus" size={13} />New design
            </button>
          </div>

          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ position: 'relative', maxWidth: 360 }}>
              <div style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }}>
                <Icon name="search" size={13} />
              </div>
              <input className="af-search" style={{ paddingLeft: 28, height: 32 }} placeholder="Search designs…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignContent: 'start' }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>Loading designs…</div>
            ) : filtered.length === 0 && search ? (
              <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>No designs matching "{search}"</div>
            ) : (
              filtered.map(d => (
                <DesignCard key={d.id} design={d} onOpen={() => openDesign(d.id)} onDelete={() => deleteDesign(d.id)} />
              ))
            )}

            {/* New design card */}
            <div onClick={newDesign} style={{ border: '1.5px dashed var(--border-strong)', borderRadius: 10, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--text-4)', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--indigo)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--indigo-2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--text-4)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px dashed currentColor', display: 'grid', placeItems: 'center' }}>
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
