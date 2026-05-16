import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGroq } from '@ai-sdk/groq'

export function getModel() {
  const provider = process.env.AI_PROVIDER ?? 'anthropic'
  const apiKey   = process.env.AI_API_KEY
  const modelId  = process.env.AI_MODEL

  switch (provider) {
    case 'openai': {
      const client = createOpenAI({ apiKey: apiKey ?? process.env.OPENAI_API_KEY ?? '' })
      return client(modelId ?? 'gpt-4o')
    }
    case 'groq': {
      const client = createGroq({ apiKey: apiKey ?? process.env.GROQ_API_KEY ?? '' })
      return client(modelId ?? 'llama-3.3-70b-versatile')
    }
    default: {
      const client = createAnthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY ?? '' })
      return client(modelId ?? 'claude-sonnet-4-5')
    }
  }
}
