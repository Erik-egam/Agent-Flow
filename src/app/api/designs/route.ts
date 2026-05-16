import { getDb } from '@/lib/db'
import { validateDesign } from '@/lib/schema/serialize'

export const dynamic = 'force-dynamic'

interface DesignRow {
  id: string
  name: string
  description: string | null
  framework: string
  data: string
  updatedAt: string
  createdAt: string
}

export async function GET() {
  try {
    const db = getDb()
    const rows = db.prepare(
      `SELECT id, name, description, framework, data, updatedAt, createdAt
       FROM Design ORDER BY updatedAt DESC`
    ).all() as DesignRow[]

    const list = rows.map(r => {
      let nodeCount = 0
      try { nodeCount = (JSON.parse(r.data) as { nodes?: unknown[] }).nodes?.length ?? 0 } catch { /* ignore */ }
      return { id: r.id, name: r.name, description: r.description ?? '', framework: r.framework, nodeCount, updatedAt: r.updatedAt, createdAt: r.createdAt }
    })
    return Response.json(list)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to list designs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb()
    const body = await req.json() as { design: unknown }
    const validation = validateDesign(body.design)
    if (!validation.success) return Response.json({ error: validation.error }, { status: 400 })

    const design = validation.data
    const now = new Date().toISOString()

    db.prepare(
      `INSERT OR REPLACE INTO Design (id, name, description, framework, data, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, '[]', ?, ?)`
    ).run(design.id, design.name, design.description ?? '', design.framework ?? 'langgraph', JSON.stringify(design), now, now)

    return Response.json({ id: design.id, updatedAt: now }, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to create design' }, { status: 500 })
  }
}
