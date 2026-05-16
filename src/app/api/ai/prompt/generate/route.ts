import { generateText } from 'ai'
import { getModel } from '@/lib/ai/getModel'

const SYSTEM = `You are an expert prompt engineer specializing in LLM system prompts for AI agent systems.
Generate clear, effective system prompts based on the provided configuration.
Use markdown headers and bullet points. Include {{template_variable}} placeholders where dynamic context is needed.
Return ONLY the system prompt content — no preamble, no explanation, no code blocks.`

function buildPrompt(config: Record<string, unknown>): string {
  const parts = [`Generate a system prompt for the following AI agent:`]
  if (config.role)        parts.push(`Role: ${config.role}`)
  if (config.context)     parts.push(`Context: ${config.context}`)
  if (config.constraints && Array.isArray(config.constraints)) parts.push(`Constraints: ${config.constraints.join(', ')}`)
  if (config.outputFormat) parts.push(`Output format: ${config.outputFormat}`)
  if (config.style)       parts.push(`Writing style: ${config.style}`)
  if (config.length)      parts.push(`Prompt length: ${config.length}`)
  if (config.fewShot)     parts.push(`Few-shot examples:\n${config.fewShot}`)
  return parts.join('\n')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text } = await generateText({
      model: getModel(),
      system: SYSTEM,
      prompt: buildPrompt(body),
      maxOutputTokens: 1200,
    })
    return Response.json({ text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
