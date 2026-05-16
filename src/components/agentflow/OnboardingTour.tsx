'use client'

import { useState } from 'react'
import Icon from './Icon'

const STEPS = [
  {
    title: 'Welcome to AgentFlow',
    icon: 'cpu',
    body: 'AgentFlow is a visual designer for multi-agent AI systems. Drag nodes, connect them, and export to LangGraph-compatible JSON — no code required.',
    tip: null,
  },
  {
    title: 'The Node Palette',
    icon: 'layers',
    body: 'The left sidebar contains all node types: Input, Agent, Tool, Memory, Orchestrator, Conditional, Human Loop, State Node, Subgraph, and more.',
    tip: 'Drag any node from the palette and drop it on the canvas.',
  },
  {
    title: 'Building on the Canvas',
    icon: 'git-branch',
    body: 'Connect nodes by dragging from one handle (right side) to another (left side). Each connection represents data flowing between components.',
    tip: 'Hold Shift and drag to select multiple nodes at once.',
  },
  {
    title: 'Properties Panel',
    icon: 'settings',
    body: 'Click any node to open its Properties panel. Agent nodes have a built-in Prompt IDE with AI-assisted generation. Every node type has tailored configuration fields.',
    tip: 'Agent and Orchestrator nodes have a "Prompt IDE" tab for crafting system prompts.',
  },
  {
    title: 'Run & Debug',
    icon: 'play',
    body: 'Click Run (top-right) to execute your design against a real AI API. Watch nodes animate in real time, inspect outputs, and review the execution log.',
    tip: 'Set AI_API_KEY in your .env file before running.',
  },
  {
    title: 'Templates & Export',
    icon: 'package',
    body: 'Start from a pre-built template (Designs → Templates) or export your design as a .agentflow.json file to version-control, share, or use as code input.',
    tip: 'Use the AI Assistant (chat icon) to get design advice in context.',
  },
]

const TOUR_KEY = 'af-tour-seen'

export function shouldShowTour(): boolean {
  if (typeof window === 'undefined') return false
  return !localStorage.getItem(TOUR_KEY)
}

interface Props {
  onClose: () => void
}

export default function OnboardingTour({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function finish() {
    localStorage.setItem(TOUR_KEY, '1')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-strong)', borderRadius: 14, width: 460, boxShadow: '0 32px 100px rgba(0,0,0,0.7)', overflow: 'hidden' }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--surface-3)' }}>
          <div style={{ height: '100%', background: 'var(--indigo)', width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--indigo-dim)', color: 'var(--indigo)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name={current.icon} size={20} sw={1.8} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1.3 }}>{current.title}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>Step {step + 1} of {STEPS.length}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 28px', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
          {current.body}
        </div>

        {/* Tip */}
        {current.tip && (
          <div style={{ margin: '0 28px 16px', padding: '10px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: 12.5, color: 'var(--indigo-2)', display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.5 }}>
            <Icon name="sparkles" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            {current.tip}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '14px 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
          <button className="af-btn af-btn-ghost" style={{ fontSize: 12, height: 30 }} onClick={finish}>
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {step > 0 && (
              <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 12px', fontSize: 12.5 }} onClick={() => setStep(s => s - 1)}>
                <Icon name="chevron-left" size={13} /> Back
              </button>
            )}
            {isLast ? (
              <button className="af-btn af-btn-primary" style={{ height: 32, padding: '4px 18px', fontSize: 13 }} onClick={finish}>
                Get started <Icon name="arrow-right" size={13} />
              </button>
            ) : (
              <button className="af-btn af-btn-primary" style={{ height: 32, padding: '4px 18px', fontSize: 13 }} onClick={() => setStep(s => s + 1)}>
                Next <Icon name="chevron-right" size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
