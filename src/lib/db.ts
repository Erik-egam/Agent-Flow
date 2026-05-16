import Database from 'better-sqlite3'
import path from 'node:path'

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  const raw = process.env.DATABASE_URL ?? 'file:./data/agentflow.db'
  const filePath = raw.replace(/^file:/, '')
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  _db = new Database(resolved)
  _db.pragma('journal_mode = WAL')
  return _db
}
