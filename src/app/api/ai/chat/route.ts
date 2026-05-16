import { streamText } from 'ai'
import { getModel } from '@/lib/ai/getModel'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SYSTEM_PREFIX = `You are AgentFlow Assistant — an expert in multi-agent system design using LangGraph and LangChain.
You help users design, debug, and improve their AI agent pipelines.

You have access to the user's current design in JSON format. Use it to give specific, actionable advice.

When suggesting a new node, use this exact format so the UI can offer a one-click "Apply" button:
  [SUGGEST_NODE type="<type>" name="<name>" reason="<brief reason>"]

Valid types: input, output, agent, tool, orchestrator, memory, conditional, human, state, subgraph

When suggesting to connect two nodes, use:
  [SUGGEST_EDGE from="<nodeId or name>" to="<nodeId or name>" label="<optional label>"]

Keep responses concise. Use markdown for clarity.`

interface ChatBody {
  designId?: string
  message: string
  designJson?: unknown
  history?: { role: 'user' | 'assistant'; content: string }[]
}

interface ChatRow {
  id: string
  role: string
  content: string
  createdAt: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ChatBody
    const { designId, message, designJson, history = [] } = body

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const designContext = designJson
      ? `\n\nCurrent design JSON:\n\`\`\`json\n${JSON.stringify(designJson, null, 2).slice(0, 6000)}\n\`\`\``
      : ''

    const systemPrompt = SYSTEM_PREFIX + designContext

    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user' as const, content: message },
    ]

    const result = streamText({
      model: getModel(),
      system: systemPrompt,
      messages,
      maxOutputTokens: 1200,
    })

    // Collect full response to save to DB
    let fullResponse = ''
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          fullResponse += chunk
          controller.enqueue(encoder.encode(chunk))
        }

        // Save both messages to DB if designId provided
        if (designId) {
          try {
            const db = getDb()
            const now = new Date().toISOString()
            const insertMsg = db.prepare(
              `INSERT INTO ChatMessage (id, designId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)`
            )
            insertMsg.run(`m-${Date.now()}-u`, designId, 'user', message, now)
            insertMsg.run(`m-${Date.now()}-a`, designId, 'assistant', fullResponse, now)
          } catch (e) {
            console.error('[chat] DB save error:', e)
          }
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Chat failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const designId = searchParams.get('designId')
    if (!designId) return Response.json({ error: 'designId required' }, { status: 400 })

    const db = getDb()
    const rows = db.prepare(
      `SELECT id, role, content, createdAt FROM ChatMessage WHERE designId = ? ORDER BY createdAt ASC LIMIT 200`
    ).all(designId) as ChatRow[]

    return Response.json(rows)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to load history' }, { status: 500 })
  }
}
