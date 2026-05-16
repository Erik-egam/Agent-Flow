import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  const raw = process.env.DATABASE_URL ?? 'file:./data/agentflow.db'
  const filePath = raw.replace(/^file:/, '')
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  fs.mkdirSync(path.dirname(resolved), { recursive: true })
  _db = new Database(resolved)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = OFF')
  initTables(_db)
  return _db
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ChatMessage (
      id        TEXT PRIMARY KEY,
      designId  TEXT NOT NULL,
      role      TEXT NOT NULL,
      content   TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chat_design ON ChatMessage(designId, createdAt);
  `)
}
