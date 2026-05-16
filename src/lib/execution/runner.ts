import { generateText } from 'ai'
import { getModel } from '@/lib/ai/getModel'
import { getDb } from '@/lib/db'
import { createRun, pushEvent } from './eventBuffer'
import type { RunConfig, SerializedNode, ExecutionEvent } from './types'

function generateRunId() {
  return `run_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
}

// ── Graph utilities ──────────────────────────────────────────

function buildGraph(nodes: SerializedNode[], edges: Array<{ source: string; target: string }>) {
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()
  for (const n of nodes) { outgoing.set(n.id, []); incoming.set(n.id, []) }
  for (const e of edges) {
    outgoing.get(e.source)?.push(e.target)
    incoming.get(e.target)?.push(e.source)
  }
  return { outgoing, incoming }
}

function topoSort(
  nodes: SerializedNode[],
  outgoing: Map<string, string[]>,
  incoming: Map<string, string[]>,
): SerializedNode[] {
  const inDeg = new Map(nodes.map(n => [n.id, incoming.get(n.id)?.length ?? 0]))
  const queue = nodes.filter(n => (inDeg.get(n.id) ?? 0) === 0)
  const sorted: SerializedNode[] = []
  while (queue.length > 0) {
    const node = queue.shift()!
    sorted.push(node)
    for (const next of outgoing.get(node.id) ?? []) {
      const deg = (inDeg.get(next) ?? 1) - 1
      inDeg.set(next, deg)
      if (deg === 0) {
        const nxt = nodes.find(n => n.id === next)
        if (nxt) queue.push(nxt)
      }
    }
  }
  return sorted
}

// ── Node executors ───────────────────────────────────────────

async function executeInput(node: SerializedNode, rawInput: string): Promise<string> {
  const varName = String(node.data.outputVar ?? 'query')
  try {
    const parsed = JSON.parse(rawInput) as Record<string, unknown>
    return String(parsed[varName] ?? rawInput)
  } catch {
    return rawInput
  }
}

async function executeAgent(
  node: SerializedNode,
  context: string,
  runId: string,
): Promise<string> {
  const systemPrompt = String(node.data.systemPrompt ?? `You are ${node.name}, a helpful AI assistant.`)
  const provider = String(node.data.provider ?? 'anthropic')
  const model = String(node.data.model ?? 'claude-sonnet-4-5')
  const maxOutputTokens = Number(node.data.maxTokens ?? 2048)

  const { text } = await generateText({
    model: getModel({ provider, model }),
    system: systemPrompt,
    prompt: context,
    maxOutputTokens,
  })

  pushEvent(runId, {
    type: 'node_stream',
    runId,
    nodeId: node.id,
    nodeName: node.name,
    nodeType: String(node.data.type),
    text: text.slice(0, 300) + (text.length > 300 ? '…' : ''),
    timestamp: Date.now(),
  })
  return text
}

async function executeTool(node: SerializedNode, context: string): Promise<string> {
  const fnName = String(node.data.functionName ?? node.name)
  await new Promise(r => setTimeout(r, 150 + Math.random() * 200))
  return JSON.stringify({ tool: fnName, result: `Mock: ${context.slice(0, 80)}`, status: 'success' })
}

// ── Main entry ───────────────────────────────────────────────

export async function runDesign(config: RunConfig): Promise<string> {
  const runId = generateRunId()
  createRun(runId)

  // Save initial run record to SQLite — only if design is already persisted
  if (config.designId) {
    try {
      const db = getDb()
      db.prepare(
        `INSERT INTO ExecutionRun (id, designId, input, status, events, createdAt, updatedAt)
         VALUES (?, ?, ?, 'running', '[]', datetime('now'), datetime('now'))`
      ).run(runId, config.designId, String(config.input ?? '').slice(0, 2000))
    } catch (sqlErr) {
      console.warn('[AgentFlow] Could not persist run:', sqlErr)
    }
  }

  // Fire & forget execution (pass full config so designId is available for persistence)
  executeGraph(runId, config).catch(err => {
    console.error('[AgentFlow] Execution error:', err)
    pushEvent(runId, {
      type: 'run_error',
      runId,
      timestamp: Date.now(),
      error: String(err instanceof Error ? err.message : err),
    })
  })

  return runId
}

async function executeGraph(runId: string, config: RunConfig) {
  const { nodes, edges, input } = config
  const { outgoing, incoming } = buildGraph(nodes, edges)
  const sorted = topoSort(nodes, outgoing, incoming)
  const startTime = Date.now()

  pushEvent(runId, { type: 'run_start', runId, timestamp: Date.now() })

  const nodeOutputs = new Map<string, string>()
  const allEvents: ExecutionEvent[] = []

  for (const node of sorted) {
    const nType = String(node.data.type ?? node.type ?? 'unknown')
    const incomingOutputs = (incoming.get(node.id) ?? [])
      .map(id => nodeOutputs.get(id) ?? '')
      .filter(Boolean)
    const context = incomingOutputs.length > 0 ? incomingOutputs.join('\n\n') : input

    const startEvt: ExecutionEvent = {
      type: 'node_start',
      runId,
      nodeId: node.id,
      nodeName: node.name,
      nodeType: nType,
      timestamp: Date.now(),
    }
    pushEvent(runId, startEvt)
    allEvents.push(startEvt)

    try {
      let output = ''
      switch (nType) {
        case 'input':
          output = await executeInput(node, input)
          break
        case 'agent':
        case 'orchestrator':
          output = await executeAgent(node, context, runId)
          break
        case 'tool':
          output = await executeTool(node, context)
          break
        case 'output':
          output = context
          break
        default:
          output = context
      }

      nodeOutputs.set(node.id, output)
      const completeEvt: ExecutionEvent = {
        type: 'node_complete',
        runId,
        nodeId: node.id,
        nodeName: node.name,
        nodeType: nType,
        output: output.slice(0, 1000) + (output.length > 1000 ? '…' : ''),
        timestamp: Date.now(),
      }
      pushEvent(runId, completeEvt)
      allEvents.push(completeEvt)

    } catch (err) {
      const errEvt: ExecutionEvent = {
        type: 'node_error',
        runId,
        nodeId: node.id,
        nodeName: node.name,
        nodeType: nType,
        error: String(err instanceof Error ? err.message : err),
        timestamp: Date.now(),
      }
      pushEvent(runId, errEvt)
      allEvents.push(errEvt)
      // Continue to next node even on error
    }
  }

  const duration = Date.now() - startTime
  const doneEvt: ExecutionEvent = {
    type: 'run_complete',
    runId,
    status: 'completed',
    totalTokens: 0,
    duration,
    timestamp: Date.now(),
  }
  pushEvent(runId, doneEvt)
  allEvents.push(doneEvt)

  // Persist completed run (only if design was saved)
  if (config.designId) {
    try {
      const db = getDb()
      db.prepare(
        `UPDATE ExecutionRun SET status='completed', events=?, updatedAt=datetime('now') WHERE id=?`
      ).run(JSON.stringify(allEvents), runId)
    } catch { /* ignore */ }
  }
}
