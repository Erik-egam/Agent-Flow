import { getDb } from '@/lib/db'
import { validateDesign } from '@/lib/schema/serialize'

export const dynamic = 'force-dynamic'

interface DesignRow { id: string; data: string }

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const row = getDb().prepare('SELECT data FROM Design WHERE id = ?').get(id) as DesignRow | undefined
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(JSON.parse(row.data))
  } catch {
    return Response.json({ error: 'Failed to fetch design' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json() as { design: unknown }
    const validation = validateDesign(body.design)
    if (!validation.success) return Response.json({ error: validation.error }, { status: 400 })

    const design = validation.data
    const now = new Date().toISOString()
    const updated = { ...design, metadata: { ...design.metadata, updatedAt: now } }

    const result = getDb().prepare(
      `UPDATE Design SET name = ?, description = ?, framework = ?, data = ?, updatedAt = ? WHERE id = ?`
    ).run(design.name, design.description ?? '', design.framework ?? 'langgraph', JSON.stringify(updated), now, id)

    if (result.changes === 0) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ id, updatedAt: now })
  } catch {
    return Response.json({ error: 'Failed to update design' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    getDb().prepare('DELETE FROM Design WHERE id = ?').run(id)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to delete design' }, { status: 500 })
  }
}
