import type { AgentFlowDesign } from '@/lib/schema/agentflow'

const now = '2026-01-01T00:00:00.000Z'

export interface Template {
  id: string
  name: string
  description: string
  pattern: string
  design: AgentFlowDesign
}

export const TEMPLATES: Template[] = [
  // ── 1. ReAct Agent ────────────────────────────────────────
  {
    id: 'tpl-react-agent',
    name: 'ReAct Agent',
    description: 'Single agent that reasons and acts in cycles, using web search.',
    pattern: 'single-agent',
    design: {
      version: '1.0',
      id: 'tpl-react-agent',
      name: 'ReAct Agent — web search',
      description: 'Single ReAct agent with web search tool. Reasons before each action.',
      framework: 'langgraph',
      nodes: [
        { id: 'n1', type: 'input',  name: 'User Query',   position: { x: 60,  y: 200 }, data: { type: 'input',  name: 'User Query',   chips: [], status: 'idle', outputVar: 'query', schema: '{ query: string }' } },
        { id: 'n2', type: 'agent',  name: 'ReAct Agent',  position: { x: 340, y: 200 }, data: { type: 'agent',  name: 'ReAct Agent',  chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.7, maxTokens: 4096, systemPrompt: 'You are a helpful research assistant. Use the web_search tool to find up-to-date information before answering. Always cite your sources.' } },
        { id: 'n3', type: 'tool',   name: 'web_search',   position: { x: 620, y: 80  }, data: { type: 'tool',   name: 'web_search',   chips: [], status: 'idle', functionName: 'web_search', description: 'Search the web for current information', parameters: [{ name: 'query', type: 'string', required: true, description: 'Search query' }], returnType: 'SearchResult[]' } },
        { id: 'n4', type: 'memory', name: 'Conversation', position: { x: 620, y: 340 }, data: { type: 'memory', name: 'Conversation', chips: [], status: 'idle', memoryType: 'buffer', store: 'in_memory', maxMessages: 20 } },
        { id: 'n5', type: 'output', name: 'Answer',       position: { x: 920, y: 200 }, data: { type: 'output', name: 'Answer',       chips: [], status: 'idle', inputVar: 'result', format: 'markdown' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n4' },
        { id: 'e4', source: 'n2', target: 'n5' },
      ],
      metadata: { createdAt: now, updatedAt: now },
    },
  },

  // ── 2. Supervisor Multi-Agent ──────────────────────────────
  {
    id: 'tpl-supervisor',
    name: 'Supervisor Multi-Agent',
    description: 'Orchestrator routes to specialized sub-agents based on intent.',
    pattern: 'supervisor',
    design: {
      version: '1.0',
      id: 'tpl-supervisor',
      name: 'Supervisor — 3 sub-agents',
      description: 'Supervisor multi-agent: routes to researcher, writer, or coder based on the query.',
      framework: 'langgraph',
      nodes: [
        { id: 'n1', type: 'input',        name: 'Task',         position: { x: 60,  y: 300 }, data: { type: 'input',        name: 'Task',         chips: [], status: 'idle', outputVar: 'task', schema: '{ task: string }' } },
        { id: 'n2', type: 'orchestrator', name: 'Supervisor',   position: { x: 320, y: 300 }, data: { type: 'orchestrator', name: 'Supervisor',   chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.3, systemPrompt: 'Route the task to the most appropriate specialist. Researcher for finding information, Writer for creating content, Coder for programming tasks.', routes: [{ agent: 'Researcher', when: 'task requires finding information or research', priority: 'high', isDefault: false }, { agent: 'Writer', when: 'task requires writing, editing, or content creation', priority: 'normal', isDefault: false }, { agent: 'Coder', when: 'task involves code, programming, or technical implementation', priority: 'normal', isDefault: true }] } },
        { id: 'n3', type: 'agent',        name: 'Researcher',   position: { x: 620, y: 100 }, data: { type: 'agent',        name: 'Researcher',   chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.5, maxTokens: 4096, systemPrompt: 'You are an expert researcher. Find accurate, up-to-date information and provide well-sourced answers.' } },
        { id: 'n4', type: 'agent',        name: 'Writer',       position: { x: 620, y: 300 }, data: { type: 'agent',        name: 'Writer',       chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.8, maxTokens: 4096, systemPrompt: 'You are a skilled writer. Create engaging, clear, and well-structured content tailored to the audience.' } },
        { id: 'n5', type: 'agent',        name: 'Coder',        position: { x: 620, y: 500 }, data: { type: 'agent',        name: 'Coder',        chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.3, maxTokens: 4096, systemPrompt: 'You are an expert software engineer. Write clean, well-documented code with error handling.' } },
        { id: 'n6', type: 'output',       name: 'Result',       position: { x: 920, y: 300 }, data: { type: 'output',       name: 'Result',       chips: [], status: 'idle', inputVar: 'result', format: 'markdown' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3', label: 'research' },
        { id: 'e3', source: 'n2', target: 'n4', label: 'write' },
        { id: 'e4', source: 'n2', target: 'n5', label: 'code' },
        { id: 'e5', source: 'n3', target: 'n6' },
        { id: 'e6', source: 'n4', target: 'n6' },
        { id: 'e7', source: 'n5', target: 'n6' },
      ],
      metadata: { createdAt: now, updatedAt: now },
    },
  },

  // ── 3. LangGraph StateGraph ────────────────────────────────
  {
    id: 'tpl-stategraph',
    name: 'LangGraph StateGraph',
    description: 'Explicit StateGraph with shared state flowing through nodes.',
    pattern: 'stategraph',
    design: {
      version: '1.0',
      id: 'tpl-stategraph',
      name: 'LangGraph StateGraph',
      description: 'Basic StateGraph: classify intent → process → format output. All nodes share typed state.',
      framework: 'langgraph',
      nodes: [
        { id: 'n1', type: 'input',  name: 'User Input',  position: { x: 60,  y: 200 }, data: { type: 'input',  name: 'User Input',  chips: [], status: 'idle', outputVar: 'messages', schema: '{ message: string }' } },
        { id: 'n2', type: 'state',  name: 'Classifier',  position: { x: 320, y: 200 }, data: { type: 'state',  name: 'Classifier',  chips: [], status: 'idle', nodeFn: 'classify_intent', isEntry: true, isEnd: false, fields: [{ key: 'messages', type: 'list[BaseMessage]' }, { key: 'intent', type: 'str' }, { key: 'result', type: 'str' }], reads: ['messages'], writes: ['intent'] } },
        { id: 'n3', type: 'state',  name: 'Processor',   position: { x: 620, y: 200 }, data: { type: 'state',  name: 'Processor',   chips: [], status: 'idle', nodeFn: 'process_task', isEntry: false, isEnd: false, fields: [{ key: 'messages', type: 'list[BaseMessage]' }, { key: 'intent', type: 'str' }, { key: 'result', type: 'str' }], reads: ['messages', 'intent'], writes: ['result'] } },
        { id: 'n4', type: 'state',  name: 'Formatter',   position: { x: 920, y: 200 }, data: { type: 'state',  name: 'Formatter',   chips: [], status: 'idle', nodeFn: 'format_output', isEntry: false, isEnd: true,  fields: [{ key: 'messages', type: 'list[BaseMessage]' }, { key: 'intent', type: 'str' }, { key: 'result', type: 'str' }], reads: ['result'], writes: ['messages'] } },
        { id: 'n5', type: 'output', name: 'Response',    position: { x: 1200, y: 200 }, data: { type: 'output', name: 'Response',    chips: [], status: 'idle', inputVar: 'result', format: 'markdown' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
      ],
      metadata: { createdAt: now, updatedAt: now },
    },
  },

  // ── 4. RAG Pipeline ───────────────────────────────────────
  {
    id: 'tpl-rag',
    name: 'RAG Pipeline',
    description: 'Retrieval Augmented Generation with a vector store for knowledge base queries.',
    pattern: 'rag',
    design: {
      version: '1.0',
      id: 'tpl-rag',
      name: 'RAG — Vector store retrieval',
      description: 'Query a knowledge base with semantic search and generate grounded answers.',
      framework: 'langgraph',
      nodes: [
        { id: 'n1', type: 'input',  name: 'Question',    position: { x: 60,  y: 250 }, data: { type: 'input',  name: 'Question',    chips: [], status: 'idle', outputVar: 'query', schema: '{ query: string }' } },
        { id: 'n2', type: 'memory', name: 'Knowledge Base', position: { x: 350, y: 400 }, data: { type: 'memory', name: 'Knowledge Base', chips: [], status: 'idle', memoryType: 'vector_store', store: 'chroma', collection: 'knowledge', embeddingProvider: 'openai', embeddingModel: 'text-embedding-3-small', returnTopK: 4 } },
        { id: 'n3', type: 'agent',  name: 'Retriever',   position: { x: 350, y: 150 }, data: { type: 'agent',  name: 'Retriever',   chips: [], status: 'idle', provider: 'anthropic', model: 'claude-haiku-4-5-20251001', temperature: 0.1, maxTokens: 512, systemPrompt: 'Generate a semantic search query to retrieve relevant documents for the user question.' } },
        { id: 'n4', type: 'agent',  name: 'Generator',   position: { x: 680, y: 250 }, data: { type: 'agent',  name: 'Generator',   chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.5, maxTokens: 2048, systemPrompt: 'You are a knowledgeable assistant. Answer the question using ONLY the retrieved context. If the context is insufficient, say so clearly. Cite relevant passages.' } },
        { id: 'n5', type: 'output', name: 'Answer',      position: { x: 980, y: 250 }, data: { type: 'output', name: 'Answer',      chips: [], status: 'idle', inputVar: 'result', format: 'markdown' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n3' },
        { id: 'e2', source: 'n3', target: 'n2', label: 'retrieve' },
        { id: 'e3', source: 'n2', target: 'n4', label: 'context' },
        { id: 'e4', source: 'n1', target: 'n4' },
        { id: 'e5', source: 'n4', target: 'n5' },
      ],
      metadata: { createdAt: now, updatedAt: now },
    },
  },

  // ── 5. Human-in-the-Loop ──────────────────────────────────
  {
    id: 'tpl-hitl',
    name: 'Human-in-the-Loop',
    description: 'Agent drafts content, a human approves or requests revisions before publishing.',
    pattern: 'hitl',
    design: {
      version: '1.0',
      id: 'tpl-hitl',
      name: 'Human-in-the-Loop — draft & review',
      description: 'AI drafts content → human approval → publish or revise loop.',
      framework: 'langgraph',
      nodes: [
        { id: 'n1', type: 'input',  name: 'Brief',         position: { x: 60,  y: 250 }, data: { type: 'input',  name: 'Brief',         chips: [], status: 'idle', outputVar: 'brief', schema: '{ topic: string, tone: string, length: string }' } },
        { id: 'n2', type: 'agent',  name: 'Drafter',       position: { x: 320, y: 250 }, data: { type: 'agent',  name: 'Drafter',       chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.8, maxTokens: 2048, systemPrompt: 'You are a professional content writer. Create a high-quality draft based on the provided brief. Structure it clearly with a compelling opening, well-developed body, and strong conclusion.' } },
        { id: 'n3', type: 'human',  name: 'Review',        position: { x: 620, y: 250 }, data: { type: 'human',  name: 'Review',        chips: [], status: 'idle', promptMessage: 'Please review the draft and approve or request revisions:', inputType: 'approval', timeout: 3600, onTimeout: 'reject', notificationChannel: 'none' } },
        { id: 'n4', type: 'agent',  name: 'Publisher',     position: { x: 920, y: 100 }, data: { type: 'agent',  name: 'Publisher',     chips: [], status: 'idle', provider: 'anthropic', model: 'claude-haiku-4-5-20251001', temperature: 0.2, maxTokens: 512, systemPrompt: 'Format and finalize the approved content for publication. Add any necessary metadata.' } },
        { id: 'n5', type: 'agent',  name: 'Reviser',       position: { x: 920, y: 400 }, data: { type: 'agent',  name: 'Reviser',       chips: [], status: 'idle', provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.7, maxTokens: 2048, systemPrompt: 'Revise the draft based on the feedback provided. Maintain the original intent while addressing all requested changes.' } },
        { id: 'n6', type: 'output', name: 'Published',     position: { x: 1200, y: 250 }, data: { type: 'output', name: 'Published',     chips: [], status: 'idle', inputVar: 'result', format: 'markdown' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4', label: 'approved' },
        { id: 'e4', source: 'n3', target: 'n5', label: 'revise' },
        { id: 'e5', source: 'n5', target: 'n3', label: 'resubmit' },
        { id: 'e6', source: 'n4', target: 'n6' },
      ],
      metadata: { createdAt: now, updatedAt: now },
    },
  },
]
