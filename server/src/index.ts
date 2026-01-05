import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './drizzle/db.js'
import { commuteStats } from './drizzle/schema.js'
import { eq, and, desc } from 'drizzle-orm'

const app = new Hono()

// Enable CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// GET /api/commute-stats - Get commute statistics
// Query params: year (optional), semester (optional: 1=WS, 2=SS), category (optional: 'gesamt', 'studierende', 'mitarbeiter')
app.get('/api/commute-stats', async (c) => {
  const year = c.req.query('year')
  const semester = c.req.query('semester')
  const category = c.req.query('category') || 'gesamt'

  const conditions = [eq(commuteStats.category, category)]
  
  if (year) {
    conditions.push(eq(commuteStats.year, parseInt(year)))
  }
  if (semester) {
    conditions.push(eq(commuteStats.month, parseInt(semester)))
  }

  const data = await db.select().from(commuteStats)
    .where(and(...conditions))
    .orderBy(desc(commuteStats.personCount))
  
  return c.json(data)
})

// GET /api/commute-stats/periods - Get available time periods (semesters)
// Returns: { year, semester, label } where semester 1=WS, 2=SS
app.get('/api/commute-stats/periods', async (c) => {
  const data = await db.selectDistinct({ year: commuteStats.year, semester: commuteStats.month })
    .from(commuteStats)
    .orderBy(desc(commuteStats.year), desc(commuteStats.month))
  
  // Add human-readable labels
  const periodsWithLabels = data.map(p => ({
    year: p.year,
    semester: p.semester,
    label: p.semester === 1 ? `WS ${p.year}/${(p.year + 1).toString().slice(-2)}` : `SS ${p.year}`
  }))
  
  return c.json(periodsWithLabels)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
