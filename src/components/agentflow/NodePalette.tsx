'use client'

import { useState } from 'react'
import Icon from './Icon'
import { PALETTE_CATS, NODE_TYPES } from './constants'

interface NodePaletteProps {
  width?: number
}

export default function NodePalette({ width = 232 }: NodePaletteProps) {
  const [closedCats, setClosedCats] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  function toggleCat(id: string) {
    setClosedCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredCats = PALETTE_CATS.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (!search) return true
      const nodeType = NODE_TYPES[item]
      return nodeType?.label.toLowerCase().includes(search.toLowerCase())
    }),
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="af-panel" style={{ width, flexShrink: 0, overflowY: 'auto' }}>
      <div className="af-panel-header">Nodes</div>

      <div className="af-panel-search" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }}>
          <Icon name="search" size={12} />
        </div>
        <input
          className="af-search"
          placeholder="Search nodes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ overflowY: 'auto', flex: '1 1 auto' }}>
        {filteredCats.map(cat => {
          const isClosed = closedCats.has(cat.id)
          return (
            <div key={cat.id} className={`af-cat${isClosed ? ' closed' : ''}`}>
              <div className="af-cat-header" onClick={() => toggleCat(cat.id)}>
                <span className="af-cat-chev">
                  <Icon name="chevron-down" size={10} sw={2.5} />
                </span>
                <span>{cat.label}</span>
              </div>
              <div className="af-cat-items">
                {cat.items.map(typeKey => {
                  const nodeType = NODE_TYPES[typeKey]
                  if (!nodeType) return null
                  return (
                    <div key={typeKey} className="af-pal-item" draggable>
                      <div
                        className="af-pal-icon"
                        style={{
                          background: `color-mix(in srgb, ${nodeType.color} 15%, transparent)`,
                          color: nodeType.color,
                        }}
                      >
                        <Icon name={nodeType.icon} size={13} sw={1.8} />
                      </div>
                      <span>{nodeType.label}</span>
                      <span className="af-grip">
                        <Icon name="grip" size={12} />
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
