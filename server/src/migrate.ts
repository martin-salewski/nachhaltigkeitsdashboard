import 'dotenv/config'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from './drizzle/db.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
await migrate(db, { migrationsFolder: path.join(__dirname, 'drizzle/migrations') })
console.log('[migrate] Migrations erfolgreich angewendet')
