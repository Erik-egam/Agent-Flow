import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RunRow {
  id: string
  designId: string
  input: string
  status: string
  events: string
  createdAt: string
  updatedAt: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const designId = searchParams.get('designId')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const rows = designId
      ? getDb().prepare('SELECT id, designId, input, status, events, createdAt, updatedAt FROM ExecutionRun WHERE designId=? ORDER BY createdAt DESC LIMIT ?').all(designId, limit) as RunRow[]
      : getDb().prepare('SELECT id, designId, input, status, events, createdAt, updatedAt FROM ExecutionRun ORDER BY createdAt DESC LIMIT ?').all(limit) as RunRow[]

    return Response.json(rows.map(r => ({
      ...r,
      events: JSON.parse(r.events) as unknown[],
    })))
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
