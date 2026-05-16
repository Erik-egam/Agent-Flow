'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import Icon from './Icon'
import { NODE_TYPES } from './constants'
import type { FlowNodeData } from '@/store/useFlowStore'

function FlowNode({ data, selected }: NodeProps) {
  const d = data as FlowNodeData
  const nodeType = NODE_TYPES[d.type]
  const color = nodeType?.color ?? 'var(--indigo)'
  const icon = nodeType?.icon ?? 'circle'
  const status = d.status ?? 'idle'

  return (
    <div
      className={`af-node${selected ? ' is-selected' : ''}`}
      style={{ position: 'relative', '--node-color': color } as React.CSSProperties}
    >
      {d.type !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          className="af-rf-handle"
        />
      )}

      <div className="af-node-head">
        <div className="af-node-icon">
          <Icon name={icon} size={12} sw={1.8} />
        </div>
        <span className="af-node-name">{d.name}</span>
        <div className={`af-node-status${status !== 'idle' ? ` ${status}` : ''}`} />
      </div>

      {d.chips.length > 0 && (
        <div className="af-node-body">
          {d.chips.map((chip, i) => (
            <div key={i} className="af-chip">
              <span className="af-chip-k">{chip.k}</span>
              <span className="af-chip-v">{chip.v}</span>
            </div>
          ))}
        </div>
      )}

      {d.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="af-rf-handle"
        />
      )}
    </div>
  )
}

export default memo(FlowNode)
