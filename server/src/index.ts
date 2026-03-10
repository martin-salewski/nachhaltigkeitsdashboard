import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './drizzle/db.js'
import { commuteStats,
  emissions,
  buildingRating,
  peopleStats,
  staffDemographics,
  studentDemographics,
  mensaMenu,
  mensaMealStats } from './drizzle/schema.js'
import { eq, and, desc, asc } from 'drizzle-orm'
import { runXmlImport } from './jobs/xmlImport.js'

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

// GET /api/emissions - Get emissions data
// Query params: year, month, category (optional: 'gesamt', 'strom', 'heizung', 'mobilitaet')
app.get('/api/emissions', async (c) => {
  const year = c.req.query('year')
  const month = c.req.query('month')
  const category = c.req.query('category') || 'gesamt'

  const conditions = [eq(emissions.category, category)]
  
  if (year) {
    conditions.push(eq(emissions.year, parseInt(year)))
  }
  if (month) {
    conditions.push(eq(emissions.month, parseInt(month)))
  }

  const data = await db.select().from(emissions)
    .where(and(...conditions))
    .orderBy(asc(emissions.year), asc(emissions.month), asc(emissions.day))
  
  return c.json(data)
})

// GET /api/emissions/periods - Get available months
app.get('/api/emissions/periods', async (c) => {
  const data = await db.selectDistinct({ year: emissions.year, month: emissions.month })
    .from(emissions)
    .orderBy(desc(emissions.year), desc(emissions.month))
  
  const monthNames = ['jan', 'feb', 'mär', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dez']
  
  const periodsWithLabels = data.map(p => ({
    year: p.year,
    month: p.month,
    label: monthNames[p.month - 1]
  }))
  
  return c.json(periodsWithLabels)
})

app.get("/api/building_rating", async (c) => {
  const scoreParam = c.req.query("score"); // string | undefined
  const score = scoreParam ? Number(scoreParam) : undefined;

  const query = db
    .select({
      year: buildingRating.year,
      month: buildingRating.month,
      score: buildingRating.score,
      co2PerPerson: buildingRating.co2PerPerson,
    })
    .from(buildingRating);

  const rows =
    score !== undefined && !Number.isNaN(score)
      ? await query.where(eq(buildingRating.score, score))
      : await query;

      return c.json(rows);
    });
    
    app.get("api/people_stats", async (c) => {
      const latest = c.req.query("latest") === "1";
    
      if (latest) {
       
        const result = await db
          .select()
          .from(peopleStats)
          .orderBy(desc(peopleStats.year), desc(peopleStats.month))
          .limit(1);
    
        return c.json(result);
      }
    
      const all = await db.select().from(peopleStats);
      return c.json(all);
    });

    app.get('/api/staff_demographics/years', async (c) => {
      const data = await db
        .selectDistinct({ year: staffDemographics.year })
        .from(staffDemographics)
        .orderBy(staffDemographics.year);
    
      return c.json(data.map((d) => d.year));
    });

app.get('/api/staff_demographics', async (c) => {
  const year = c.req.query('year')

  const query = db.select().from(staffDemographics)

  const data = year
    ? await query.where(eq(staffDemographics.year, parseInt(year)))
    : await query

  return c.json(data)
})


// GET /api/student_demographics
app.get('/api/student_demographics', async (c) => {
  const year = c.req.query('year')

  const query = db.select().from(studentDemographics)

  const data = year
    ? await query.where(eq(studentDemographics.year, parseInt(year)))
    : await query

  return c.json(data)
})

// GET /api/student_demographics/years
app.get('/api/student_demographics/years', async (c) => {
  const data = await db
    .selectDistinct({ year: studentDemographics.year })
    .from(studentDemographics)
    .orderBy(asc(studentDemographics.year))

  return c.json(data.map(r => r.year))
})

 app.post("/admin/import", async (c) => {
  try {
    await runXmlImport();
    return c.json({ success: true, message: "Import erfolgreich abgeschlossen" });
  } catch (err) {
    return c.json({ success: false, message: String(err) }, 500);
  }
}); 

app.get("/api/mensa_menu", async (c) => {
  const date = c.req.query("date") ?? new Date().toISOString().split("T")[0];
  
  const menu = await db
    .select()
    .from(mensaMenu)
    .where(eq(mensaMenu.date, date));

  return c.json(menu);
});

export default app;

/* app.delete("/admin/clear", async (c) => {
  await db.delete(mensaMenu);
  return c.json({ success: true, message: "Alle Einträge gelöscht" });
}); */

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
