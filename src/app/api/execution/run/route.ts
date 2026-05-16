import { runDesign } from '@/lib/execution/runner'
import type { RunConfig } from '@/lib/execution/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json() as RunConfig
    if (!body.input) return Response.json({ error: 'input is required' }, { status: 400 })
    if (!Array.isArray(body.nodes) || body.nodes.length === 0) {
      return Response.json({ error: 'nodes array is required' }, { status: 400 })
    }
    const runId = await runDesign(body)
    return Response.json({ runId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Execution failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
