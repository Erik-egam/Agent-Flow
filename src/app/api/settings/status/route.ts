export const dynamic = 'force-dynamic'

export async function GET() {
  const provider = process.env.AI_PROVIDER ?? 'anthropic'
  const model = process.env.AI_MODEL ?? (
    provider === 'openai' ? 'gpt-4o' :
    provider === 'groq'   ? 'llama-3.3-70b-versatile' :
                            'claude-sonnet-4-5'
  )
  const hasKey = Boolean(
    process.env.AI_API_KEY ??
    (provider === 'openai' ? process.env.OPENAI_API_KEY :
     provider === 'groq'   ? process.env.GROQ_API_KEY :
                             process.env.ANTHROPIC_API_KEY)
  )
  return Response.json({ provider, model, hasKey })
}
