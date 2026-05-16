import type { ExecutionEvent } from './types'

interface RunEntry {
  events: string[]
  done: boolean
}

// Global in-memory store: runId → buffered SSE lines
const registry = new Map<string, RunEntry>()

export function createRun(runId: string): void {
  registry.set(runId, { events: [], done: false })
}

export function pushEvent(runId: string, event: ExecutionEvent): void {
  const run = registry.get(runId)
  if (!run) return
  run.events.push(`data: ${JSON.stringify(event)}\n\n`)
  if (event.type === 'run_complete' || event.type === 'run_error') {
    run.done = true
  }
}

export function getRun(runId: string): RunEntry | undefined {
  return registry.get(runId)
}

export function deleteRun(runId: string): void {
  registry.delete(runId)
}
