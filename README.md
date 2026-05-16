# AgentFlow

**Visual designer for multi-agent AI systems.** Drag, connect, configure, and export — no code required.

> Self-hosteable with Docker · Exports LangGraph-compatible JSON · AI-assisted prompt engineering

---

## What is it?

AgentFlow is an open-source canvas editor for designing multi-agent pipelines. You visually compose agents, tools, memory stores, and control-flow nodes, then export the result as a structured JSON schema that can drive a LangGraph/LangChain runtime.

**Key features:**

- **Canvas editor** — drag-and-drop node palette, multi-select, undo/redo, mini-map
- **All node types** — Agent, Tool, Memory, Orchestrator, Conditional, Human Loop, State Node, Subgraph, Note, Group/Frame
- **Prompt IDE** — Monaco editor with AI-assisted generation, refinement, and diff view
- **Live execution** — run your design against a real LLM API; watch edges animate in real time
- **AI Assistant** — contextual chat panel that knows your design and can suggest nodes
- **Templates** — 5 ready-to-run patterns: ReAct, Supervisor, StateGraph, RAG, Human-in-the-loop
- **Import / Export** — `.agentflow.json` with thumbnail, round-trips with 100% fidelity
- **Dark / Light mode** — persisted per browser
- **Self-hosted** — single Docker container, SQLite database, no external services required

---

## Quick start (Docker)

```bash
# 1. Clone
git clone https://github.com/your-username/agentflow.git
cd agentflow

# 2. Set your AI provider key (Anthropic, OpenAI, or Groq)
echo "AI_PROVIDER=anthropic" >> .env
echo "AI_API_KEY=sk-ant-..." >> .env

# 3. Start
docker compose up
```

Open **http://localhost:3000** in your browser.

> `docker compose up` works on Mac, Linux, and Windows without additional configuration.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `anthropic` | `anthropic` · `openai` · `groq` |
| `AI_API_KEY` | — | API key for the chosen provider |
| `AI_MODEL` | provider default | Override the model (e.g. `gpt-4o`) |
| `DATABASE_URL` | `file:./data/agentflow.db` | SQLite file path |
| `PORT` | `3000` | HTTP port |

---

## Development setup

```bash
# Requirements: Node 22+, pnpm 11+

pnpm install
pnpm prisma generate
cp .env.example .env   # add your AI_API_KEY
pnpm dev               # http://localhost:3000
```

### Project structure

```
src/
├── app/
│   ├── editor/          # Main canvas editor page
│   ├── designs/         # Design library + templates
│   └── api/             # Next.js API routes
│       ├── ai/          # chat, prompt generate/refine, routing simulate
│       ├── designs/     # CRUD for saved designs
│       └── execution/   # Run engine + SSE stream
├── components/agentflow/
│   ├── Canvas.tsx       # ReactFlow canvas + validation
│   ├── FlowNode.tsx     # Node renderer
│   ├── PropertiesPanel.tsx  # Per-node config panels
│   ├── SystemPromptIDE.tsx  # Monaco-based prompt editor
│   ├── ChatPanel.tsx    # AI assistant sidebar
│   ├── ExecutionDebugger.tsx
│   └── ...
├── lib/
│   ├── schema/          # Zod schema + serialize/deserialize
│   ├── templates/       # 5 built-in templates
│   ├── execution/       # Node executors + SSE runner
│   ├── validation/      # Canvas validation rules
│   └── ai/              # Model factory (Anthropic/OpenAI/Groq)
└── store/
    └── useFlowStore.ts  # Zustand store (nodes, edges, undo/redo)
```

---

## Node types

| Type | Category | Description |
|------|----------|-------------|
| `input` | I/O | Entry point — defines the input schema |
| `output` | I/O | Exit point — formats the final response |
| `agent` | Core | LLM agent with system prompt, tools, memory |
| `tool` | Core | Function the agent can invoke |
| `orchestrator` | Orchestration | Supervisor/pipeline/swarm coordinator |
| `memory` | Memory | Buffer, summary, entity, or vector store |
| `conditional` | Control flow | Routes to different branches |
| `human` | Control flow | Pauses for human approval or input |
| `state` | LangGraph | Explicit StateGraph node with typed state |
| `subgraph` | Structure | References another AgentFlow design |
| `note` | Canvas | Visual annotation (no effect on execution) |
| `group` | Canvas | Frame to group related nodes |

Full field reference: [`docs/schema.md`](docs/schema.md)

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Open keyboard shortcuts |
| `Ctrl+S` | Save design |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+Enter` | Toggle execution debugger |
| `Delete` | Delete selected node/edge |
| `Shift+drag` | Multi-select |

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT
