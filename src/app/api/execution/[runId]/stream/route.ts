import { getRun } from '@/lib/execution/eventBuffer'

export const dynamic = 'force-dynamic'

const POLL_INTERVAL = 50  // ms
const MAX_WAIT = 30_000   // 30s timeout

export async function GET(_req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const run = getRun(runId)

  if (!run) {
    return Response.json({ error: 'Run not found' }, { status: 404 })
  }

  const encoder = new TextEncoder()
  let index = 0
  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'))

      while (true) {
        // Send any buffered events
        while (index < run.events.length) {
          controller.enqueue(encoder.encode(run.events[index]))
          index++
        }

        // Check if run is done
        if (run.done) {
          controller.close()
          return
        }

        // Timeout guard
        if (Date.now() - startTime > MAX_WAIT) {
          controller.close()
          return
        }

        // Poll
        await new Promise(r => setTimeout(r, POLL_INTERVAL))
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
