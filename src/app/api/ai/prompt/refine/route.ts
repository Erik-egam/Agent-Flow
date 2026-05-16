import { generateText } from 'ai'
import { getModel } from '@/lib/ai/getModel'

const SYSTEM = `You are an expert prompt engineer. You refine existing AI agent system prompts based on user instructions.
Preserve the structure and intent of the original prompt. Apply only the requested changes.
Return ONLY the refined system prompt — no preamble, no explanation.`

export async function POST(req: Request) {
  try {
    const { currentPrompt, instruction } = await req.json() as { currentPrompt: string; instruction: string }
    const { text } = await generateText({
      model: getModel(),
      system: SYSTEM,
      prompt: `Current system prompt:\n\n${currentPrompt}\n\nRefinement instruction: ${instruction}\n\nRefined prompt:`,
      maxOutputTokens: 1200,
    })
    return Response.json({ text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Refinement failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
