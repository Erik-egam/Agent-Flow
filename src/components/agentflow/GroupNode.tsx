'use client'

import { memo, useState } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'

interface GroupData {
  label?: string
  color?: string
}

function GroupNode({ data, selected }: NodeProps) {
  const d = data as GroupData
  const [label, setLabel] = useState(d.label ?? 'Group')
  const color = d.color ?? 'rgba(99,102,241,0.15)'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: color,
        border: selected ? '1.5px solid rgba(99,102,241,0.6)' : '1px dashed rgba(255,255,255,0.15)',
        borderRadius: 10,
        position: 'relative',
        pointerEvents: 'all',
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        lineStyle={{ borderColor: 'rgba(99,102,241,0.5)' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2, background: 'var(--indigo)' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 12,
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          pointerEvents: 'all',
        }}
      >
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            letterSpacing: 'inherit',
            textTransform: 'inherit',
            width: 160,
            cursor: 'text',
          }}
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

export default memo(GroupNode)
