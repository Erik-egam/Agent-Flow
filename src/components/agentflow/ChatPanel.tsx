'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Icon from './Icon'
import { useFlowStore } from '@/store/useFlowStore'
import { serialize } from '@/lib/schema/serialize'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface SuggestedNode {
  type: string
  name: string
  reason: string
}

// Parse [SUGGEST_NODE type="..." name="..." reason="..."] from assistant message
function parseSuggestions(content: string): SuggestedNode[] {
  const re = /\[SUGGEST_NODE\s+type="([^"]+)"\s+name="([^"]+)"\s+reason="([^"]+)"\]/g
  const results: SuggestedNode[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    results.push({ type: m[1], name: m[2], reason: m[3] })
  }
  return results
}

// Strip suggestion tags from visible text
function stripTags(content: string): string {
  return content.replace(/\[SUGGEST_NODE[^\]]+\]/g, '').replace(/\[SUGGEST_EDGE[^\]]+\]/g, '').trim()
}

interface ChatPanelProps {
  designId?: string | null
  onClose: () => void
}

export default function ChatPanel({ designId, onClose }: ChatPanelProps) {
  const { nodes, edges, designName, addNode } = useFlowStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [apiReady, setApiReady] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Check if API key is configured
  useEffect(() => {
    fetch('/api/settings/status')
      .then(r => r.json())
      .then((d: { configured?: boolean }) => setApiReady(d.configured ?? false))
      .catch(() => setApiReady(false))
  }, [])

  // Load history if design is saved
  useEffect(() => {
    if (!designId) return
    fetch(`/api/ai/chat?designId=${designId}`)
      .then(r => r.json())
      .then((rows: { id: string; role: string; content: string }[]) => {
        setMessages(rows.map(r => ({ id: r.id, role: r.role as 'user' | 'assistant', content: r.content })))
      })
      .catch(() => { /* ignore */ })
  }, [designId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text }
    const assistantId = `a-${Date.now()}`
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }])
    setStreaming(true)

    const designJson = serialize(nodes, edges, designName, designId ?? undefined)
    const history = messages.map(m => ({ role: m.role, content: m.content }))

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId, message: text, designJson, history }),
        signal: abort.signal,
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `Error: ${err.error ?? 'Unknown'}` } : m))
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m))
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Connection error. Check your API key and try again.' } : m))
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [input, streaming, messages, nodes, edges, designName, designId])

  function applyNode(suggestion: SuggestedNode) {
    addNode({
      id: `n-${Date.now()}`,
      type: 'flowNode',
      position: { x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 },
      data: {
        type: suggestion.type,
        name: suggestion.name,
        chips: [],
        status: 'idle',
      },
    })
  }

  function renderMessage(msg: Message) {
    const isUser = msg.role === 'user'
    const visible = stripTags(msg.content)
    const suggestions = msg.role === 'assistant' ? parseSuggestions(msg.content) : []

    return (
      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            background: isUser ? 'var(--indigo)' : 'var(--surface-3)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name={isUser ? 'user' : 'cpu'} size={11} sw={1.8} />
          </div>
          <div style={{
            flex: 1, fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-2)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {visible || (streaming && msg.role === 'assistant' && <span style={{ opacity: 0.4 }}>…</span>)}
          </div>
        </div>

        {suggestions.length > 0 && (
          <div style={{ marginLeft: 30, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {suggestions.map((s, i) => (
              <button key={i} className="af-btn" style={{ fontSize: 11, height: 28, gap: 6, justifyContent: 'flex-start', maxWidth: 240 }}
                onClick={() => applyNode(s)}>
                <Icon name="plus" size={11} />
                Add {s.name} ({s.type})
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="af-panel af-panel-right" style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="af-panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: 'var(--indigo)', display: 'grid', placeItems: 'center' }}>
            <Icon name="message-square" size={11} sw={1.8} />
          </div>
          <span>AI Assistant</span>
        </div>
        <button className="af-btn af-btn-ghost" style={{ height: 24, padding: '3px 6px' }} onClick={onClose}>
          <Icon name="x" size={12} />
        </button>
      </div>

      {/* API key warning */}
      {apiReady === false && (
        <div style={{ margin: '8px 12px', padding: '10px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, fontSize: 11.5, color: 'var(--amber)', lineHeight: 1.5 }}>
          <strong>API key not configured.</strong><br />
          Set <code style={{ fontSize: 10.5 }}>AI_API_KEY</code> (and optionally <code style={{ fontSize: 10.5 }}>AI_PROVIDER</code>, <code style={{ fontSize: 10.5 }}>AI_MODEL</code>) in your <code style={{ fontSize: 10.5 }}>.env</code> file and restart the server.
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        {messages.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-4)', fontSize: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <Icon name="message-square" size={24} />
            </div>
            Ask anything about your design.<br />
            <span style={{ fontSize: 11 }}>I can suggest nodes, review your architecture, and help debug flows.</span>
          </div>
        )}
        {messages.map(renderMessage)}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            'Review my design architecture',
            'What nodes am I missing?',
            'How can I add error handling?',
          ].map(prompt => (
            <button key={prompt} className="af-btn af-btn-ghost" style={{ fontSize: 11, height: 26, justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => { setInput(prompt); }}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '8px 12px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
        <textarea
          className="af-textarea"
          style={{ flex: 1, minHeight: 60, maxHeight: 120, resize: 'none', fontSize: 12.5 }}
          placeholder="Ask about your design…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage() }
          }}
          disabled={streaming}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button className="af-btn af-btn-primary" style={{ height: 30, padding: '4px 8px' }}
            onClick={() => void sendMessage()} disabled={streaming || !input.trim()}>
            <Icon name={streaming ? 'loader' : 'send'} size={12} />
          </button>
          {streaming && (
            <button className="af-btn af-btn-ghost" style={{ height: 30, padding: '4px 8px' }}
              onClick={() => abortRef.current?.abort()}>
              <Icon name="square" size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
