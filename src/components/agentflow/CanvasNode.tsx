'use client'

import Icon from './Icon'
import { NODE_TYPES } from './constants'

interface Chip {
  k: string
  v: string
}

interface CanvasNodeProps {
  id: string
  type: string
  name: string
  chips: Chip[]
  x: number
  y: number
  selected?: boolean
  status?: 'ok' | 'run' | 'err' | 'idle'
  hasIn?: boolean
  hasOut?: boolean
  width?: number
  onClick?: (id: string) => void
}

export default function CanvasNode({
  id,
  type,
  name,
  chips,
  x,
  y,
  selected = false,
  status = 'idle',
  hasIn = false,
  hasOut = false,
  width = 200,
  onClick,
}: CanvasNodeProps) {
  const nodeType = NODE_TYPES[type]
  const color = nodeType?.color ?? 'var(--indigo)'
  const icon = nodeType?.icon ?? 'circle'

  return (
    <div
      className={`af-node${selected ? ' is-selected' : ''}`}
      style={
        {
          left: x,
          top: y,
          width,
          '--node-color': color,
          cursor: 'pointer',
        } as React.CSSProperties
      }
      onClick={() => onClick?.(id)}
    >
      {/* Input handle */}
      {hasIn && (
        <div className="af-handle in has" />
      )}
      {!hasIn && type !== 'input' && (
        <div className="af-handle in" />
      )}

      <div className="af-node-head">
        <div className="af-node-icon">
          <Icon name={icon} size={12} sw={1.8} />
        </div>
        <span className="af-node-name">{name}</span>
        <div className={`af-node-status${status !== 'idle' ? ` ${status}` : ''}`} />
      </div>

      {chips.length > 0 && (
        <div className="af-node-body">
          {chips.map((chip, i) => (
            <div key={i} className="af-chip">
              <span className="af-chip-k">{chip.k}</span>
              <span className="af-chip-v">{chip.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Output handle */}
      {hasOut && (
        <div className="af-handle out has" />
      )}
      {!hasOut && type !== 'output' && (
        <div className="af-handle out" />
      )}
    </div>
  )
}
