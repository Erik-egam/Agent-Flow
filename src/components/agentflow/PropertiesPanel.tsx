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
  const memoryType = String(d.memoryType ?? 'buffer')
  const store = String(d.store ?? 'sqlite')
  const isVector = memoryType === 'vector_store' || memoryType === 'combined'

  return (
    <Section title="Memory">
      <Field label="Memory type">
        <select className="af-select" value={memoryType} onChange={e => u({ memoryType: e.target.value })}>
          <option value="buffer">Buffer</option>
          <option value="summary">Summary</option>
          <option value="entity">Entity</option>
          <option value="vector_store">Vector store</option>
          <option value="combined">Combined</option>
        </select>
      </Field>
      <Field label="Storage backend">
        <select className="af-select" value={store} onChange={e => u({ store: e.target.value })}>
          <option value="in_memory">In-memory</option>
          <option value="sqlite">SQLite (local)</option>
          <option value="postgres">PostgreSQL</option>
          <option value="redis">Redis</option>
          <option value="chroma">Chroma</option>
          <option value="pinecone">Pinecone</option>
          <option value="qdrant">Qdrant</option>
        </select>
      </Field>
      {memoryType === 'buffer' && (
        <Field label="Max messages">
          <input className="af-input" type="number" min={1}
            value={Number(d.maxMessages ?? 20)} onChange={e => u({ maxMessages: parseInt(e.target.value) })} />
        </Field>
      )}
      {memoryType === 'summary' && (
        <Field label="Summarize every N messages">
          <input className="af-input" type="number" min={1}
            value={Number(d.summaryInterval ?? 10)} onChange={e => u({ summaryInterval: parseInt(e.target.value) })} />
        </Field>
      )}
      {isVector && (
        <>
          <Field label="Collection / index">
            <input className="af-input" value={String(d.collection ?? 'default')}
              onChange={e => u({ collection: e.target.value })} />
          </Field>
          <Field label="Embedding provider">
            <select className="af-select" value={String(d.embeddingProvider ?? 'openai')} onChange={e => u({ embeddingProvider: e.target.value })}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="ollama">Ollama</option>
              <option value="huggingface">HuggingFace</option>
            </select>
          </Field>
          <Field label="Embedding model">
            <input className="af-input" value={String(d.embeddingModel ?? 'text-embedding-3-small')}
              onChange={e => u({ embeddingModel: e.target.value })} />
          </Field>
          <Field label="Return top-k results">
            <input className="af-input" type="number" min={1} max={50}
              value={Number(d.returnTopK ?? 4)} onChange={e => u({ returnTopK: parseInt(e.target.value) })} />
          </Field>
        </>
      )}
    </Section>
  )
}

const ROUTE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function ConditionalConfig({ d, u }: { d: D; u: Updater }) {
  type Route = { condition: string; label: string; color: string; isDefault: boolean }
  const routes: Route[] = Array.isArray(d.routes) ? d.routes as Route[] : []
  const conditionType = String(d.conditionType ?? 'expression')

  function addRoute() {
    const color = ROUTE_COLORS[routes.length % ROUTE_COLORS.length]
    u({ routes: [...routes, { condition: '', label: '', color, isDefault: false }] })
  }
  function updateRoute(i: number, patch: Partial<Route>) {
    u({ routes: routes.map((r, idx) => idx === i ? { ...r, ...patch } : r) })
  }
  function removeRoute(i: number) {
    u({ routes: routes.filter((_, idx) => idx !== i) })
  }

  return <>
    <Section title="Condition">
      <Field label="Condition type">
        <select className="af-select" value={conditionType} onChange={e => u({ conditionType: e.target.value })}>
          <option value="expression">JS expression</option>
          <option value="llm">LLM-based</option>
          <option value="regex">Regex</option>
          <option value="json_path">JSONPath</option>
        </select>
      </Field>
      {conditionType === 'llm' && (
        <Field label="Routing prompt">
          <textarea className="af-textarea" style={{ minHeight: 64 }}
            value={String(d.llmPrompt ?? '')} placeholder="Classify the intent as: research, write, or code"
            onChange={e => u({ llmPrompt: e.target.value })} />
        </Field>
      )}
      {conditionType === 'json_path' && (
        <Field label="JSONPath expression">
          <input className="af-input" style={{ fontFamily: 'var(--font-mono)' }}
            value={String(d.jsonPath ?? '')} placeholder="$.state.intent"
            onChange={e => u({ jsonPath: e.target.value })} />
        </Field>
      )}
    </Section>
    <Section title="Routes">
      {routes.map((r, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 10, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="color" value={r.color ?? '#6366f1'} title="Edge color"
              onChange={e => updateRoute(i, { color: e.target.value })}
              style={{ width: 24, height: 24, padding: 2, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0 }} />
            <input className="af-input" style={{ flex: 1 }} value={r.label} placeholder="handle / edge name"
              onChange={e => updateRoute(i, { label: e.target.value })} />
            <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }} onClick={() => removeRoute(i)}>
              <Icon name="x" size={11} />
            </button>
          </div>
          {conditionType !== 'llm' && (
            <input className="af-input" style={{ fontFamily: 'var(--font-mono)' }}
              value={r.condition} placeholder="state.intent === 'research'"
              onChange={e => updateRoute(i, { condition: e.target.value })} />
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
            <input type="checkbox" checked={r.isDefault} onChange={e => updateRoute(i, { isDefault: e.target.checked })} />
            Default (else / fallback)
          </label>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }} onClick={addRoute}>
        <Icon name="plus" size={11} />Add route
      </button>
    </Section>
  </>
}

function HumanConfig({ d, u }: { d: D; u: Updater }) {
  const inputType = String(d.inputType ?? 'approval')
  const choices: string[] = Array.isArray(d.choices) ? d.choices as string[] : []

  return (
    <Section title="Human Loop">
      <Field label="Prompt message">
        <textarea className="af-textarea" style={{ minHeight: 64 }}
          value={String(d.promptMessage ?? '')} placeholder="Message shown to the human reviewer"
          onChange={e => u({ promptMessage: e.target.value })} />
      </Field>
      <Field label="Input type">
        <select className="af-select" value={inputType} onChange={e => u({ inputType: e.target.value })}>
          <option value="approval">Approval (yes/no)</option>
          <option value="text_input">Free text</option>
          <option value="choice">Multiple choice</option>
          <option value="form">Form (JSON Schema)</option>
        </select>
      </Field>
      {inputType === 'choice' && (
        <Field label="Choices">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {choices.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 4 }}>
                <input className="af-input" style={{ flex: 1 }} value={c}
                  onChange={e => u({ choices: choices.map((x, j) => j === i ? e.target.value : x) })} />
                <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }}
                  onClick={() => u({ choices: choices.filter((_, j) => j !== i) })}>
                  <Icon name="x" size={11} />
                </button>
              </div>
            ))}
            <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }}
              onClick={() => u({ choices: [...choices, ''] })}>
              <Icon name="plus" size={11} />Add choice
            </button>
          </div>
        </Field>
      )}
      <Field label="Timeout (seconds, 0 = no timeout)">
        <input className="af-input" type="number" min={0}
          value={Number(d.timeout ?? 0)} onChange={e => u({ timeout: parseInt(e.target.value) })} />
      </Field>
      <Field label="On timeout">
        <select className="af-select" value={String(d.onTimeout ?? 'error')} onChange={e => u({ onTimeout: e.target.value })}>
          <option value="error">Error (default)</option>
          <option value="approve">Auto-approve</option>
          <option value="reject">Auto-reject</option>
        </select>
      </Field>
      <Field label="Notification channel">
        <select className="af-select" value={String(d.notificationChannel ?? 'none')} onChange={e => u({ notificationChannel: e.target.value })}>
          <option value="none">None</option>
          <option value="email">Email</option>
          <option value="slack">Slack</option>
          <option value="webhook">Webhook</option>
        </select>
      </Field>
    </Section>
  )
}

function StateConfig({ d, u }: { d: D; u: Updater }) {
  type Field_ = { key: string; type: string; default: string }
  const fields: Field_[] = Array.isArray(d.fields) ? d.fields as Field_[] : []
  const fieldKeys = fields.map(f => f.key).filter(Boolean)
  const reads: string[] = Array.isArray(d.reads) ? d.reads as string[] : []
  const writes: string[] = Array.isArray(d.writes) ? d.writes as string[] : []

  function addField() {
    u({ fields: [...fields, { key: '', type: 'string', default: '' }] })
  }
  function updateField(i: number, patch: Partial<Field_>) {
    u({ fields: fields.map((f, idx) => idx === i ? { ...f, ...patch } : f) })
  }
  function removeField(i: number) {
    u({ fields: fields.filter((_, idx) => idx !== i) })
  }
  function toggleReads(key: string) {
    u({ reads: reads.includes(key) ? reads.filter(k => k !== key) : [...reads, key] })
  }
  function toggleWrites(key: string) {
    u({ writes: writes.includes(key) ? writes.filter(k => k !== key) : [...writes, key] })
  }

  return <>
    <Section title="State Schema">
      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 10 }}>TypedDict-like state fields shared across nodes.</div>
      {fields.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 6, alignItems: 'center' }}>
          <input className="af-input" style={{ flex: 2, fontFamily: 'var(--font-mono)' }}
            value={f.key} placeholder="key" onChange={e => updateField(i, { key: e.target.value })} />
          <select className="af-select" style={{ width: 100 }} value={f.type} onChange={e => updateField(i, { type: e.target.value })}>
            <option value="str">str</option>
            <option value="int">int</option>
            <option value="float">float</option>
            <option value="bool">bool</option>
            <option value="list[BaseMessage]">list[Msg]</option>
            <option value="list[str]">list[str]</option>
            <option value="dict">dict</option>
            <option value="Any">Any</option>
          </select>
          <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }} onClick={() => removeField(i)}>
            <Icon name="x" size={11} />
          </button>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }} onClick={addField}>
        <Icon name="plus" size={11} />Add field
      </button>
    </Section>
    {fieldKeys.length > 0 && (
      <Section title="Reads / Writes">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 10px', alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: 'var(--text-4)', fontSize: 11 }}>Field</span>
          <span style={{ color: 'var(--text-4)', fontSize: 11 }}>reads</span>
          <span style={{ color: 'var(--text-4)', fontSize: 11 }}>writes</span>
          {fieldKeys.map(key => (
            <>
              <span key={`k-${key}`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{key}</span>
              <input key={`r-${key}`} type="checkbox" checked={reads.includes(key)} onChange={() => toggleReads(key)} />
              <input key={`w-${key}`} type="checkbox" checked={writes.includes(key)} onChange={() => toggleWrites(key)} />
            </>
          ))}
        </div>
      </Section>
    )}
    <Section title="Node flags">
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', marginBottom: 6 }}>
        <input type="checkbox" checked={Boolean(d.isEntry)} onChange={e => u({ isEntry: e.target.checked, isEnd: false })} />
        Entry point (first node in graph)
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', marginBottom: 6 }}>
        <input type="checkbox" checked={Boolean(d.isEnd)} onChange={e => u({ isEnd: e.target.checked, isEntry: false })} />
        End node (graph terminates here)
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', marginBottom: 6 }}>
        <input type="checkbox" checked={Boolean(d.interruptBefore)} onChange={e => u({ interruptBefore: e.target.checked })} />
        Interrupt before (human-in-the-loop)
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
        <input type="checkbox" checked={Boolean(d.interruptAfter)} onChange={e => u({ interruptAfter: e.target.checked })} />
        Interrupt after
      </label>
    </Section>
  </>
}

function SubgraphConfig({ d, u }: { d: D; u: Updater }) {
  type Mapping = { from: string; to: string }
  const inputMapping: Mapping[] = Array.isArray(d.inputMapping) ? d.inputMapping as Mapping[] : []
  const outputMapping: Mapping[] = Array.isArray(d.outputMapping) ? d.outputMapping as Mapping[] : []

  function addMapping(key: 'inputMapping' | 'outputMapping', current: Mapping[]) {
    u({ [key]: [...current, { from: '', to: '' }] })
  }
  function updateMapping(key: 'inputMapping' | 'outputMapping', current: Mapping[], i: number, patch: Partial<Mapping>) {
    u({ [key]: current.map((m, idx) => idx === i ? { ...m, ...patch } : m) })
  }
  function removeMapping(key: 'inputMapping' | 'outputMapping', current: Mapping[], i: number) {
    u({ [key]: current.filter((_, idx) => idx !== i) })
  }

  return <>
    <Section title="Subgraph">
      <Field label="Design ID">
        <input className="af-input" style={{ fontFamily: 'var(--font-mono)' }}
          value={String(d.designId ?? '')} placeholder="design-id or name"
          onChange={e => u({ designId: e.target.value })} />
      </Field>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
        <input type="checkbox" checked={Boolean(d.inline)} onChange={e => u({ inline: e.target.checked })} />
        Show inline (expand nodes in canvas)
      </label>
    </Section>
    <Section title="Input mapping">
      <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 6 }}>Subgraph var ← current state expression</div>
      {inputMapping.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <input className="af-input" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            value={m.from} placeholder="query" onChange={e => updateMapping('inputMapping', inputMapping, i, { from: e.target.value })} />
          <span style={{ alignSelf: 'center', color: 'var(--text-4)', fontSize: 11 }}>←</span>
          <input className="af-input" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            value={m.to} placeholder="state.query" onChange={e => updateMapping('inputMapping', inputMapping, i, { to: e.target.value })} />
          <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }}
            onClick={() => removeMapping('inputMapping', inputMapping, i)}>
            <Icon name="x" size={11} />
          </button>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }}
        onClick={() => addMapping('inputMapping', inputMapping)}>
        <Icon name="plus" size={11} />Add input mapping
      </button>
    </Section>
    <Section title="Output mapping">
      <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 6 }}>Current state key ← subgraph output var</div>
      {outputMapping.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <input className="af-input" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            value={m.from} placeholder="state.result" onChange={e => updateMapping('outputMapping', outputMapping, i, { from: e.target.value })} />
          <span style={{ alignSelf: 'center', color: 'var(--text-4)', fontSize: 11 }}>←</span>
          <input className="af-input" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            value={m.to} placeholder="email_draft" onChange={e => updateMapping('outputMapping', outputMapping, i, { to: e.target.value })} />
          <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 7px' }}
            onClick={() => removeMapping('outputMapping', outputMapping, i)}>
            <Icon name="x" size={11} />
          </button>
        </div>
      ))}
      <button className="af-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 11, height: 28 }}
        onClick={() => addMapping('outputMapping', outputMapping)}>
        <Icon name="plus" size={11} />Add output mapping
      </button>
    </Section>
  </>
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
