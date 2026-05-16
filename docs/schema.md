# AgentFlow JSON Schema

Every design is serialized as a `.agentflow.json` file conforming to this schema (validated with Zod in `src/lib/schema/agentflow.ts`).

## Top-level structure

```jsonc
{
  "version": "1.0",
  "id": "uuid",
  "name": "My Design",
  "description": "Optional description",
  "framework": "langgraph",        // target runtime
  "nodes": [ /* NodeObject[] */ ],
  "edges": [ /* EdgeObject[] */ ],
  "metadata": {
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "thumbnail": "data:image/png;base64,..."  // optional, 400×225px
  }
}
```

---

## NodeObject

```jsonc
{
  "id": "n1",
  "type": "agent",           // see node types below
  "name": "My Agent",
  "position": { "x": 320, "y": 200 },
  "data": { /* type-specific fields */ }
}
```

### `input`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `outputVar` | string | ✅ | Variable name injected into the pipeline state |
| `schema` | string | — | Human-readable description of expected input |

### `output`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `inputVar` | string | ✅ | State variable to render |
| `format` | `markdown` \| `json` \| `text` | ✅ | Rendering format |

### `agent`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | `anthropic` \| `openai` \| `groq` | ✅ | LLM provider |
| `model` | string | ✅ | Model ID |
| `systemPrompt` | string | ✅ | System instructions |
| `temperature` | number | — | 0.0–2.0 |
| `maxTokens` | number | — | Max output tokens |

### `tool`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `functionName` | string | ✅ | Name the LLM uses to call the tool |
| `description` | string | ✅ | What the tool does |
| `parameters` | `{name, type, required, description}[]` | — | Input parameters |
| `returnType` | string | — | TypeScript return type |

### `orchestrator`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` / `model` | string | ✅ | Same as agent |
| `systemPrompt` | string | ✅ | Orchestrator instructions |
| `routes` | `{agent, when, priority, isDefault}[]` | — | Delegation rules |

### `memory`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `memoryType` | `buffer` \| `summary` \| `entity` \| `vector_store` \| `combined` | ✅ | Memory strategy |
| `store` | `in_memory` \| `sqlite` \| `postgres` \| `redis` \| `chroma` \| `pinecone` \| `qdrant` | ✅ | Storage backend |
| `collection` | string | — | Collection name (vector stores) |
| `embeddingProvider` | string | — | Embedding provider |
| `embeddingModel` | string | — | Embedding model ID |
| `returnTopK` | number | — | Semantic search results (default 4) |
| `maxMessages` | number | — | Buffer limit |
| `summaryInterval` | number | — | Summarize every N messages |

### `conditional`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conditionType` | `expression` \| `llm` \| `regex` \| `json_path` | ✅ | Evaluation strategy |
| `routes` | `{label, condition, color, isDefault}[]` | ✅ | Named branches |
| `llmPrompt` | string | — | Routing prompt (if `llm`) |
| `jsonPath` | string | — | JSONPath expression (if `json_path`) |

### `human`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `promptMessage` | string | ✅ | Message shown to human |
| `inputType` | `approval` \| `text_input` \| `choice` \| `form` | ✅ | Interaction type |
| `choices` | string[] | — | Options (if `choice`) |
| `timeout` | number | — | Seconds before auto-action |
| `onTimeout` | `error` \| `approve` \| `reject` | — | Timeout behavior |
| `notificationChannel` | `none` \| `email` \| `slack` \| `webhook` | — | Alert channel |

### `state` (LangGraph StateNode)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nodeFn` | string | ✅ | Function name in generated code |
| `fields` | `{key, type}[]` | ✅ | TypedDict-like state schema |
| `reads` | string[] | — | State keys this node reads |
| `writes` | string[] | — | State keys this node writes |
| `isEntry` | boolean | — | First node in the graph |
| `isEnd` | boolean | — | Terminal node |
| `interruptBefore` | boolean | — | Pause before (HITL) |
| `interruptAfter` | boolean | — | Pause after (HITL) |

### `subgraph`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `designId` | string | ✅ | ID of the referenced design |
| `inputMapping` | `{from, to}[]` | ✅ | Map current state → subgraph inputs |
| `outputMapping` | `{from, to}[]` | ✅ | Map subgraph outputs → current state |
| `inline` | boolean | — | Expand subgraph inline on canvas |

### `note` / `group`

Visual-only nodes. `note` has `content` (Markdown). `group` has `label`.

---

## EdgeObject

```jsonc
{
  "id": "e1",
  "source": "n1",
  "target": "n2",
  "label": "optional edge label",  // shown as tooltip on hover
  "data": { /* optional metadata */ }
}
```

---

## Validation

The Zod schema (`AgentFlowDesignSchema`) enforces:
- `version` must be `"1.0"`
- `nodes` must have at least one entry
- All node `id` values must be unique
- `metadata.createdAt` / `updatedAt` must be valid ISO 8601 strings

Import the validator:

```ts
import { validateDesign } from '@/lib/schema/serialize'
const result = validateDesign(rawJson)
if (!result.success) console.error(result.error) // e.g. "nodes.0.type: Required"
```
