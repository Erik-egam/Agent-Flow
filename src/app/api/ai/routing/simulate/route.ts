import { generateObject } from 'ai'
import { getModel } from '@/lib/ai/getModel'
import { z } from 'zod'

const ResultSchema = z.object({
  route: z.string().describe('The selected route / agent name'),
  reason: z.string().describe('Brief explanation of why this route was chosen'),
  confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
})

export async function POST(req: Request) {
  try {
    const { payload, routes } = await req.json() as {
      payload: string
      routes: { agent: string; when: string; isDefault: boolean }[]
    }

    const routeList = routes.map(r => `- "${r.agent}": ${r.when}${r.isDefault ? ' (default)' : ''}`).join('\n')

    const { object } = await generateObject({
      model: getModel(),
      schema: ResultSchema,
      prompt: `Given this input payload:\n${payload}\n\nAvailable routing rules:\n${routeList}\n\nDetermine which agent should handle this payload.`,
    })

    return Response.json(object)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Simulation failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
