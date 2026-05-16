import { z } from 'zod'

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.unknown()),
})

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const AgentFlowDesignSchema = z.object({
  version: z.literal('1.0'),
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  framework: z.string().default('langgraph'),
  nodes: z.array(NodeSchema).min(1, 'Design must have at least one node'),
  edges: z.array(EdgeSchema),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    thumbnail: z.string().optional(),
  }),
})

export type AgentFlowDesign = z.infer<typeof AgentFlowDesignSchema>
export type AgentFlowNode = z.infer<typeof NodeSchema>
export type AgentFlowEdge = z.infer<typeof EdgeSchema>
