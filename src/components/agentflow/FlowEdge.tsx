'use client'

import { memo, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'

interface FlowEdgeData extends Record<string, unknown> {
  color?: string
  when?: string
}

function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const d = (data ?? {}) as FlowEdgeData
  const color = d.color ?? (selected ? 'var(--indigo)' : hovered ? 'rgba(255,255,255,0.3)' : 'var(--text-4)')
  const tooltip = d.when ?? (typeof label === 'string' ? label : '')

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  })

  return (
    <>
      {/* Invisible wider hit area for hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? 2 : 1.5,
          transition: 'stroke 0.15s',
        }}
      />
      {/* Label / tooltip */}
      {(label || tooltip) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {/* Always-visible short label */}
            {label && (
              <div
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {label as string}
              </div>
            )}
            {/* Hover tooltip for "when" condition */}
            {tooltip && tooltip !== label && hovered && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 4,
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 6,
                  padding: '5px 9px',
                  fontSize: 11,
                  color: 'var(--text-2)',
                  whiteSpace: 'nowrap',
                  maxWidth: 260,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                {tooltip}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(FlowEdge)
