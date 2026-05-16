'use client'

import { useState } from 'react'
import Icon from './Icon'
import { NODE_TYPES } from './constants'
import SystemPromptIDE from './SystemPromptIDE'
import { useFlowStore, type FlowNodeData } from '@/store/useFlowStore'

// ── Shared field components ──────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="af-section">
      <div className="af-section-head">{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="af-field">
      <label className="af-label">{label}</label>
      {children}
    </div>
  )
}

type Updater = (patch: Record<string, unknown>) => void
type D = Record<string, unknown>

// ── Node-specific config panels ──────────────────────────────

function InputConfig({ d, u }: { d: D; u: Updater }) {
  return (
    <Section title="Input">
      <Field label="Output variable name">
        <input className="af-input" style={{ fontFamily: 'var(--font-mono)' }}
          value={String(d.outputVar ?? 'query')}
          onChange={e => u({ outputVar: e.target.value })} />
      </Field>
      <Field label="Input schema (description)">
        <textarea className="af-textarea" style={{ minHeight: 64 }}
          value={String(d.schema ?? '')}
          placeholder="e.g. { query: string, lang?: string }"
          onChange={e => u({ schema: e.target.value })} />
      </Field>
    </Section>
  )
}

function OutputConfig({ d, u }: { d: D; u: Updater }) {
  return (
    <Section title="Output">
      <Field label="Input variable">
        <input className="af-input" style={{ fontFamily: 'var(--font-mono)' }}
          value={String(d.inputVar ?? 'result')}
          onChange={e => u({ inputVar: e.target.value })} />
      </Field>
      <Field label="Render format">
        <select className="af-select" value={String(d.format ?? 'markdown')} onChange={e => u({ format: e.target.value })}>
          <option value="markdown">Markdown</option>
          <option value="json">JSON</option>
          <option value="text">Plain text</option>
        </select>
      </Field>
    </Section>
  )
}

function ModelConfig({ d, u }: { d: D; u: Updater }) {
  const MODELS: Record<string, string[]> = {
    anthropic: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-sonnet-4-5', 'claude-haiku-4-5-20251001'],
    openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini'],
    groq:      ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  }
  const provider = String(d.provider ?? 'anthropic')
  const models = MODELS[provider] ?? []
  const temp = Number(d.temperature ?? 0.7)
  return (
    <Section title="Model">
      <Field label="Provider">
        <select className="af-select" value={provider} onChange={e => u({ provider: e.target.value, model: MODELS[e.target.value]?.[0] ?? '' })}>
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="groq">Groq</option>
        </select>
      </Field>
      <Field label="Model">
        <select className="af-select" value={String(d.model ?? '')} onChange={e => u({ model: e.target.value })}>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label={`Temperature — ${temp.toFixed(1)}`}>
        <input type="range" min={0} max={2} step={0.1} value={temp}
          onChange={e => u({ temperature: parseFloat(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--indigo)' }} />
      </Field>
      <Field label="Max tokens">
        <input className="af-input" type="number" min={256} max={32768} step={256}
          value={Number(d.maxTokens ?? 4096)}
          onChange={e => u({ maxTokens: parseInt(e.target.value) })} />
      </Field>
    </Section>
  )
}

function IdentityConfig({ d, u }: { d: D; u: Updater }) {
  return (
    <Section title="Identity">
      <Field label="Name">
        <input className="af-input" value={String(d.name ?? '')} onChange={e => u({ name: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea className="af-textarea" style={{ minHeight: 54 }}
          value={String(d.description ?? '')} placeholder="What does this agent do?"
          onChange={e => u({ description: e.target.value })} />
      </Field>
    </Section>
  )
}

function AgentConfig({ d, u }: { d: D; u: Updater }) {
  return <>
    <IdentityConfig d={d} u={u} />
    <ModelConfig d={d} u={u} />
  </>
}

function ToolConfig({ d, u }: { d: D; u: Updater }) {
  type Param = { name: string; type: string; required: boolean; description: string }
  const params: Param[] = Array.isArray(d.parameters) ? d.parameters as Param[] : []

  function addParam() {
    u({ parameters: [...params, { name: '', type: 'string', required: false, description: '' }] })
  }
  function updateParam(i: number, patch: Partial<Param>) {
    u({ parameters: params.map((p, idx) => idx === i ? { ...p, ...patch } : p) })
  }
  function removeParam(i: number) {
    u({ parameters: params.filter((_, idx) => idx !== i) })
  }

  return <>
    <Section title="Tool">
      <Field label="Function name">
        <input className="af-input" style={{ fontFamily: 'var(--font-mono)' }}
          value={String(d.functionName ?? '')} placeholder="e.g. web_search"
          onChange={e => u({ functionName: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea className="af-textarea" style={{ minHeight: 54 }}
          value={String(d.description ?? '')} placeholder="What does this tool do?"
          onChange={e => u({ description: e.target.value })} />
      </Field>
      <Field label="Return type">
        <input className="af-input" style={{ fontFamily: 'var(--font-mono)' }}
          value={String(d.returnType ?? 'string')} placeholder="e.g. SearchResult[]"
          onChange={e => u({ returnType: e.target.value })} />
      </Field>
    </Section>
    <Section title="Parameters">
      {params.map((p, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 10, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="af-input" style={{ fontFamily: 'var(--font-mono)', flex: 1 }}
              value={p.name} placeholder="name" onChange={e => updateParam(i, { name: e.target.value })} />
            <select className="af-select" style={{ width: 90 }} value={p.type} onChange={e => updateParam(i, { type: e.target.value })}>
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
              <option value="array">array</option>
            </select>
            <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }} onClick={() => removeParam(i)}>
              <Icon name="x" size={11} />
            </button>
          </div>
          <input className="af-input" value={p.description} placeholder="description"
            onChange={e => updateParam(i, { description: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
            <input type="checkbox" checked={p.required} onChange={e => updateParam(i, { required: e.target.checked })} />
            Required
          </label>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }} onClick={addParam}>
        <Icon name="plus" size={11} />Add parameter
      </button>
    </Section>
  </>
}

function OrchestratorConfig({ d, u }: { d: D; u: Updater }) {
  type Route = { agent: string; when: string; priority: 'high' | 'normal' | 'low'; isDefault: boolean }
  const routes: Route[] = Array.isArray(d.routes) ? d.routes as Route[] : []

  const PRIORITY_COLOR = { high: '#fca5a5', normal: 'var(--indigo-2)', low: 'var(--text-3)' }

  function addRoute() {
    u({ routes: [...routes, { agent: '', when: '', priority: 'normal', isDefault: false }] })
  }
  function updateRoute(i: number, patch: Partial<Route>) {
    u({ routes: routes.map((r, idx) => idx === i ? { ...r, ...patch } : r) })
  }
  function removeRoute(i: number) {
    u({ routes: routes.filter((_, idx) => idx !== i) })
  }

  return <>
    <IdentityConfig d={d} u={u} />
    <ModelConfig d={d} u={u} />
    <Section title="Delegation Rules">
      {routes.map((r, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 10, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLOR[r.priority], flexShrink: 0 }} />
            <input className="af-input" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
              value={r.agent} placeholder="Agent name"
              onChange={e => updateRoute(i, { agent: e.target.value })} />
            <select className="af-select" style={{ width: 90 }} value={r.priority} onChange={e => updateRoute(i, { priority: e.target.value as Route['priority'] })}>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
            <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }} onClick={() => removeRoute(i)}>
              <Icon name="x" size={11} />
            </button>
          </div>
          <input className="af-input" value={r.when} placeholder="When: query contains..."
            onChange={e => updateRoute(i, { when: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
            <input type="checkbox" checked={r.isDefault} onChange={e => updateRoute(i, { isDefault: e.target.checked })} />
            Default route (fallback)
          </label>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }} onClick={addRoute}>
        <Icon name="plus" size={11} />Add route
      </button>
    </Section>
  </>
}

function MemoryConfig({ d, u }: { d: D; u: Updater }) {
  return (
    <Section title="Memory">
      <Field label="Backend">
        <select className="af-select" value={String(d.backend ?? 'sqlite')} onChange={e => u({ backend: e.target.value })}>
          <option value="sqlite">SQLite (local)</option>
          <option value="redis">Redis</option>
          <option value="pinecone">Pinecone</option>
          <option value="chroma">Chroma</option>
          <option value="in-memory">In-memory</option>
        </select>
      </Field>
      <Field label="Collection / index">
        <input className="af-input" value={String(d.collection ?? 'default')}
          onChange={e => u({ collection: e.target.value })} />
      </Field>
      <Field label="k — max results">
        <input className="af-input" type="number" min={1} max={100}
          value={Number(d.k ?? 12)} onChange={e => u({ k: parseInt(e.target.value) })} />
      </Field>
    </Section>
  )
}

function ConditionalConfig({ d, u }: { d: D; u: Updater }) {
  type Route = { condition: string; label: string; isDefault: boolean }
  const routes: Route[] = Array.isArray(d.routes) ? d.routes as Route[] : []

  function addRoute() {
    u({ routes: [...routes, { condition: '', label: '', isDefault: false }] })
  }
  function updateRoute(i: number, patch: Partial<Route>) {
    u({ routes: routes.map((r, idx) => idx === i ? { ...r, ...patch } : r) })
  }
  function removeRoute(i: number) {
    u({ routes: routes.filter((_, idx) => idx !== i) })
  }

  return (
    <Section title="Routing Conditions">
      {routes.map((r, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 10, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="af-input" style={{ flex: 1 }} value={r.label} placeholder="Label (edge name)"
              onChange={e => updateRoute(i, { label: e.target.value })} />
            <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }} onClick={() => removeRoute(i)}>
              <Icon name="x" size={11} />
            </button>
          </div>
          <input className="af-input" value={r.condition} placeholder="Condition: state.x === 'value'"
            onChange={e => updateRoute(i, { condition: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
            <input type="checkbox" checked={r.isDefault} onChange={e => updateRoute(i, { isDefault: e.target.checked })} />
            Default (else / fallback)
          </label>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }} onClick={addRoute}>
        <Icon name="plus" size={11} />Add condition
      </button>
    </Section>
  )
}

function HumanConfig({ d, u }: { d: D; u: Updater }) {
  return (
    <Section title="Human Loop">
      <Field label="Prompt message">
        <textarea className="af-textarea" style={{ minHeight: 64 }}
          value={String(d.promptMessage ?? '')} placeholder="Message shown to the human reviewer"
          onChange={e => u({ promptMessage: e.target.value })} />
      </Field>
      <Field label="Input type">
        <select className="af-select" value={String(d.inputType ?? 'approval')} onChange={e => u({ inputType: e.target.value })}>
          <option value="approval">Approval (yes/no)</option>
          <option value="text">Free text</option>
          <option value="form">Form</option>
        </select>
      </Field>
      <Field label="Timeout (seconds, 0 = no timeout)">
        <input className="af-input" type="number" min={0}
          value={Number(d.timeout ?? 0)} onChange={e => u({ timeout: parseInt(e.target.value) })} />
      </Field>
    </Section>
  )
}

function StateConfig({ d, u }: { d: D; u: Updater }) {
  type Field_ = { key: string; type: string; default: string }
  const fields: Field_[] = Array.isArray(d.fields) ? d.fields as Field_[] : []

  function addField() {
    u({ fields: [...fields, { key: '', type: 'string', default: '' }] })
  }
  function updateField(i: number, patch: Partial<Field_>) {
    u({ fields: fields.map((f, idx) => idx === i ? { ...f, ...patch } : f) })
  }
  function removeField(i: number) {
    u({ fields: fields.filter((_, idx) => idx !== i) })
  }

  return (
    <Section title="State Schema">
      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 10 }}>Define the TypedDict-like state fields shared across nodes.</div>
      {fields.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 6, alignItems: 'center' }}>
          <input className="af-input" style={{ flex: 2, fontFamily: 'var(--font-mono)' }}
            value={f.key} placeholder="key" onChange={e => updateField(i, { key: e.target.value })} />
          <select className="af-select" style={{ width: 90 }} value={f.type} onChange={e => updateField(i, { type: e.target.value })}>
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="list">list</option>
            <option value="dict">dict</option>
          </select>
          <input className="af-input" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            value={f.default} placeholder="default" onChange={e => updateField(i, { default: e.target.value })} />
          <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }} onClick={() => removeField(i)}>
            <Icon name="x" size={11} />
          </button>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }} onClick={addField}>
        <Icon name="plus" size={11} />Add field
      </button>
    </Section>
  )
}

function SubgraphConfig({ d, u }: { d: D; u: Updater }) {
  return (
    <Section title="Subgraph">
      <Field label="Design ID / name">
        <input className="af-input" value={String(d.designId ?? '')} placeholder="my-pipeline"
          onChange={e => u({ designId: e.target.value })} />
      </Field>
      <div style={{ fontSize: 11.5, color: 'var(--text-4)', padding: '4px 0' }}>
        I/O variable mapping will be available once Persistence (Phase 3) is complete.
      </div>
    </Section>
  )
}

function NoteConfig({ d, u }: { d: D; u: Updater }) {
  return (
    <Section title="Note">
      <textarea className="af-textarea" style={{ minHeight: 200, resize: 'vertical' }}
        value={String(d.content ?? '')} placeholder="Write your notes here…"
        onChange={e => u({ content: e.target.value })} />
    </Section>
  )
}

function ConfigBody({ data, update }: { data: FlowNodeData; update: Updater }) {
  const d = data as D
  switch (data.type) {
    case 'input':        return <InputConfig d={d} u={update} />
    case 'output':       return <OutputConfig d={d} u={update} />
    case 'agent':        return <AgentConfig d={d} u={update} />
    case 'tool':         return <ToolConfig d={d} u={update} />
    case 'orchestrator': return <OrchestratorConfig d={d} u={update} />
    case 'memory':       return <MemoryConfig d={d} u={update} />
    case 'conditional':  return <ConditionalConfig d={d} u={update} />
    case 'human':        return <HumanConfig d={d} u={update} />
    case 'state':        return <StateConfig d={d} u={update} />
    case 'subgraph':     return <SubgraphConfig d={d} u={update} />
    case 'note':         return <NoteConfig d={d} u={update} />
    default:             return <div style={{ padding: 16, color: 'var(--text-4)', fontSize: 12 }}>No config for this node type.</div>
  }
}

// ── Main component ───────────────────────────────────────────

interface PropertiesPanelProps {
  nodeId: string
  onClose: () => void
}

const HAS_PROMPT = new Set(['agent', 'orchestrator'])

export default function PropertiesPanel({ nodeId, onClose }: PropertiesPanelProps) {
  const { nodes, updateNodeData } = useFlowStore()
  const [tab, setTab] = useState<'config' | 'prompt'>('config')

  const node = nodes.find(n => n.id === nodeId)
  if (!node) return null

  const data = node.data as FlowNodeData
  const nodeType = NODE_TYPES[data.type]
  const color = nodeType?.color ?? 'var(--indigo)'
  const icon = nodeType?.icon ?? 'circle'
  const hasPrompt = HAS_PROMPT.has(data.type)

  function update(patch: Record<string, unknown>) {
    updateNodeData(nodeId, patch)
  }

  if (tab === 'prompt' && hasPrompt) {
    return (
      <SystemPromptIDE
        nodeId={nodeId}
        nodeName={data.name}
        nodeType={data.type}
        systemPrompt={String(data.systemPrompt ?? '')}
        onPromptChange={p => update({ systemPrompt: p })}
        onTabChange={setTab}
      />
    )
  }

  return (
    <div className="af-panel af-panel-right" style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="af-panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: `color-mix(in srgb, ${color} 15%, transparent)`, color, display: 'grid', placeItems: 'center' }}>
            <Icon name={icon} size={11} sw={1.8} />
          </div>
          <span>{nodeType?.label ?? data.type}</span>
        </div>
        <button className="af-btn af-btn-ghost" style={{ height: 24, padding: '3px 6px' }} onClick={onClose}>
          <Icon name="x" size={12} />
        </button>
      </div>

      {/* Tabs — only for nodes with system prompt */}
      {hasPrompt && (
        <div className="af-prop-tabs">
          <button className={`af-prop-tab${tab === 'config' ? ' is-active' : ''}`} onClick={() => setTab('config')}>Config</button>
          <button className={`af-prop-tab${tab === 'prompt' ? ' is-active' : ''}`} onClick={() => setTab('prompt')}>Prompt IDE</button>
        </div>
      )}

      {/* Config body */}
      <div className="af-prop-body">
        <ConfigBody data={data} update={update} />
      </div>
    </div>
  )
}
