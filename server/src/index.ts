import { randomBytes } from 'crypto'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { db } from './drizzle/db.js'
import { commuteStats,
  emissions,
  buildingRating,
  peopleStats,
  staffDemographics,
  studentDemographics,
  studentDepartment,
  mensaMenu,
  mensaMealStats,
  sustainabilityGoals,
  goalLogs,
  energyMix,
  energyConsumption,
  heatingMix,
  fossilFuels,
  waste,
  learningFacilities,
  airQuality,
  sensorData } from './drizzle/schema.js'
import { eq, and, desc, asc, gte } from 'drizzle-orm'
import { runXmlImport } from './jobs/xmlImport.js'
import type { Context } from 'hono'
import { ALLOWED_EMAIL_DOMAIN, auth } from './auth.js'

import { startScheduler } from './cron/scheduler.js'
type AuthUser = {
  id: string
  email: string
  name: string
  role: string | null
}

type Env = { Variables: { authUser: AuthUser | null } }

const app = new Hono<Env>()


/* app.use('/api', exportRoutes); */
// Security headers (defense-in-depth — nginx adds them in production too)
app.use('/*', secureHeaders({
  xFrameOptions: 'SAMEORIGIN',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
}))

// CORS — credentials: true, weil die Session als Cookie kommt. Damit ist ein
// Wildcard-Origin nicht mehr erlaubt, die Liste muss also stimmen.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174']
app.use('/*', cors({
  origin: allowedOrigins,
  credentials: true,
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Better Auth übernimmt sign-in/sign-out, Passwort-Reset und die Admin-Endpunkte.
// Muss vor der Session-Middleware stehen, sonst schlägt sie bei jedem Login-Versuch
// unnötig in der DB nach.
app.all('/api/auth/*', (c) => auth.handler(c.req.raw))

// Session einmal pro Request auflösen und im Context ablegen. Dadurch bleibt
// requireAuth() synchron und die 17 bestehenden Aufrufstellen unverändert.
app.use('/*', async (c, next) => {
  // Ohne Session-Cookie kann es keine Session geben — der DB-Treffer entfällt
  // damit auf allen öffentlichen Dashboard-Requests.
  if (c.req.raw.headers.get('cookie')?.includes('session_token')) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    c.set('authUser', session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: (session.user as { role?: string | null }).role ?? null,
        }
      : null)
  } else {
    c.set('authUser', null)
  }
  await next()
})

// Liest die von der Middleware aufgelöste Session. `requiredRole` verhält sich wie
// vorher: nur 'admin' schränkt wirklich ein, alles andere heißt "eingeloggt".
function requireAuth(c: Context<Env>, requiredRole?: 'admin' | 'mitarbeiterin') {
  const user = c.get('authUser')
  if (!user) return null
  if (requiredRole === 'admin' && user.role !== 'admin') return null
  return user
}

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
    
    app.get("/api/people_stats", async (c) => {
      const latest = parseInt(c.req.query("latest") ?? "0");

      if (latest > 0) {
        const result = await db
          .select()
          .from(peopleStats)
          .orderBy(desc(peopleStats.year))
          .limit(latest);
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

app.post('/api/student_demographics', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json();
  const result = await db.insert(studentDemographics).values(body);

  return c.json({ success: true, message: 'Daten gespeichert!' });
});

app.put('/api/student_demographics/:id', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  
  const result = await db
    .update(studentDemographics)
    .set({
      year: body.year,
      qualification: body.qualification,
      gender: body.gender,
      count: body.count,
    })
    .where(eq(studentDemographics.id, id))
    .returning();

  return c.json({ success: true, message: 'Daten aktualisiert!' });
});

app.post('/api/staff_demographics', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json();
  const result = await db.insert(staffDemographics).values(body);

  return c.json ({ success: true, message: 'Daten gespeichert!'})
});

app.put('/api/staff_demographics/:id', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const id = Number(c.req.param('id'));
  const body = await c.req.json();

  const result = await db
    .update(staffDemographics)
    .set({
      year: body.year,
      department: body.department,
      gender: body.gender,
      count: body.count,
    })
    .where(eq(staffDemographics.id, id))
    .returning();

  return c.json({ success: true, message: 'Daten aktualisiert!' });
});

app.post('/api/people_stats', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json()
  const result = await db.insert(peopleStats).values(body);
  return c.json ({sucess: true, message:'Daten gespeichert!'})
});

app.delete('/api/people_stats/year/:year', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const year = Number(c.req.param('year'))
  await db.delete(peopleStats).where(eq(peopleStats.year, year))
  return c.json({ success: true, message: 'Jahresdaten gelöscht!' })
});

app.put('/api/people_stats/:id', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  
  const result = await db
    .update(peopleStats)
    .set({
      year: body.year,
      professors: body.professors,
      employees: body.employees,
      students: body.students
    })
    .where(eq(peopleStats.id, id))
    .returning();

  return c.json({ success: true, message: 'Daten aktualisiert!' });
});

// GET /api/student_department/years
app.get('/api/student_department/years', async (c) => {
  const data = await db
    .selectDistinct({ year: studentDepartment.year })
    .from(studentDepartment)
    .orderBy(asc(studentDepartment.year))
  return c.json(data.map((d) => d.year))
})

// GET /api/student_department
app.get('/api/student_department', async (c) => {
  const year = c.req.query('year')
  const data = year
    ? await db.select().from(studentDepartment).where(eq(studentDepartment.year, parseInt(year)))
    : await db.select().from(studentDepartment)
  return c.json(data)
})

app.post('/api/student_department', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json()
  await db.insert(studentDepartment).values(body)
  return c.json({ success: true, message: 'Daten gespeichert!' })
})

app.put('/api/student_department/:id', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  await db.update(studentDepartment).set({
    year: body.year,
    department: body.department,
    gender: body.gender,
    count: body.count,
  }).where(eq(studentDepartment.id, id))
  return c.json({ success: true, message: 'Daten aktualisiert!' })
})

// GET /api/student_demographics/years
app.get('/api/student_demographics/years', async (c) => {
  const data = await db
    .selectDistinct({ year: studentDemographics.year })
    .from(studentDemographics)
    .orderBy(asc(studentDemographics.year))

  return c.json(data.map(r => r.year))
})

// GET /api/sustainability_goals
app.get('/api/sustainability_goals', async (c) => {
  const data = await db.select().from(sustainabilityGoals)
  return c.json(data)
})

// POST /api/sustainability_goals
app.post('/api/sustainability_goals', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json()
  const { title, description, targetYear, targetValue } = body as {
    title: string
    description?: string
    targetYear: number
    targetValue?: number
  }
  if (!title || !targetYear) return c.json({ error: 'title and targetYear required' }, 400)
  const [row] = await db.insert(sustainabilityGoals).values({
    title,
    description: description ?? null,
    targetYear: Number(targetYear),
    targetValue: targetValue != null ? Number(targetValue) : null,
    unit: targetValue != null ? 't CO₂' : null,
    isCompleted: 0,
  }).returning()
  await db.insert(goalLogs).values({
    action: 'created',
    goalTitle: title,
    username: user?.email ?? 'unbekannt',
    timestamp: Math.floor(Date.now() / 1000),
  })
  return c.json(row, 201)
})

// PATCH /api/sustainability_goals/:id/toggle
app.patch('/api/sustainability_goals/:id/toggle', async (c) => {
  if (!requireAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const id = parseInt(c.req.param('id'))
  const [current] = await db.select().from(sustainabilityGoals).where(eq(sustainabilityGoals.id, id))
  if (!current) return c.json({ error: 'Not found' }, 404)
  const [updated] = await db
    .update(sustainabilityGoals)
    .set({ isCompleted: current.isCompleted ? 0 : 1 })
    .where(eq(sustainabilityGoals.id, id))
    .returning()
  return c.json(updated)
})

// DELETE /api/sustainability_goals/:id
app.delete('/api/sustainability_goals/:id', async (c) => {
  const user = requireAuth(c, 'mitarbeiterin')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const id = parseInt(c.req.param('id'))
  const [goal] = await db.select().from(sustainabilityGoals).where(eq(sustainabilityGoals.id, id))
  if (goal) {
    await db.insert(goalLogs).values({
      action: 'deleted',
      goalTitle: goal.title,
      username: user.email,
      timestamp: Math.floor(Date.now() / 1000),
    })
  }
  await db.delete(sustainabilityGoals).where(eq(sustainabilityGoals.id, id))
  return c.json({ success: true })
})

// GET /api/goal_logs
app.get('/api/goal_logs', async (c) => {
  const user = requireAuth(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const data = await db.select().from(goalLogs).orderBy(desc(goalLogs.timestamp))
  return c.json(data)
})

// GET /api/energy_mix?year=2024
app.get('/api/energy_mix', async (c) => {
  const year = c.req.query('year')
  const data = year
    ? await db.select().from(energyMix).where(eq(energyMix.year, parseInt(year)))
    : await db.select().from(energyMix).orderBy(desc(energyMix.year))
  return c.json(data)
})

// GET /api/energy_consumption?year=2024&month=6&type=Strom
app.get('/api/energy_consumption', async (c) => {
  const year = c.req.query('year')
  const month = c.req.query('month')
  const type = c.req.query('type')

  const conditions = []
  if (year) conditions.push(eq(energyConsumption.year, parseInt(year)))
  if (month) conditions.push(eq(energyConsumption.month, parseInt(month)))
  if (type) conditions.push(eq(energyConsumption.type, type))

  const data = conditions.length
    ? await db.select().from(energyConsumption).where(and(...conditions)).orderBy(asc(energyConsumption.year), asc(energyConsumption.month))
    : await db.select().from(energyConsumption).orderBy(asc(energyConsumption.year), asc(energyConsumption.month))
  return c.json(data)
})

// GET /api/energy_consumption/periods
app.get('/api/energy_consumption/periods', async (c) => {
  const data = await db.selectDistinct({ year: energyConsumption.year, month: energyConsumption.month })
    .from(energyConsumption)
    .orderBy(desc(energyConsumption.year), desc(energyConsumption.month))
  return c.json(data)
})

// GET /api/heating_mix?year=2024
app.get('/api/heating_mix', async (c) => {
  const year = c.req.query('year')
  const data = year
    ? await db.select().from(heatingMix).where(eq(heatingMix.year, parseInt(year)))
    : await db.select().from(heatingMix).orderBy(desc(heatingMix.year))
  return c.json(data)
})

// GET /api/fossil_fuels?year=2024
app.get('/api/fossil_fuels', async (c) => {
  const year = c.req.query('year')
  const data = year
    ? await db.select().from(fossilFuels).where(eq(fossilFuels.year, parseInt(year)))
    : await db.select().from(fossilFuels).orderBy(desc(fossilFuels.year))
  return c.json(data)
})

// GET /api/waste?year=2024&week=12&category=Papier
app.get('/api/waste', async (c) => {
  const year = c.req.query('year')
  const week = c.req.query('week')
  const category = c.req.query('category')

  const conditions = []
  if (year) conditions.push(eq(waste.year, parseInt(year)))
  if (week) conditions.push(eq(waste.week, parseInt(week)))
  if (category) conditions.push(eq(waste.category, category))

  const data = conditions.length
    ? await db.select().from(waste).where(and(...conditions)).orderBy(asc(waste.year), asc(waste.week))
    : await db.select().from(waste).orderBy(asc(waste.year), asc(waste.week))
  return c.json(data)
})

// GET /api/mensa_meal_stats?date=2024-06-01
app.get('/api/mensa_meal_stats', async (c) => {
  const date = c.req.query('date')
  const data = date
    ? await db.select().from(mensaMealStats).where(eq(mensaMealStats.date, date))
    : await db.select().from(mensaMealStats)
  return c.json(data)
})

// GET /api/air_quality?limit=96
app.get('/api/air_quality', async (c) => {
  const limit = parseInt(c.req.query('limit') ?? '96')
  const data = await db
    .select()
    .from(airQuality)
    .orderBy(desc(airQuality.timestamp))
    .limit(limit)
  return c.json(data.reverse())
})

// GET /api/sensor_data/locations — distinct rooms
app.get('/api/sensor_data/locations', async (c) => {
  const rows = await db.selectDistinct({ location: sensorData.location }).from(sensorData).orderBy(asc(sensorData.location))
  return c.json(rows.map(r => r.location))
})

// GET /api/sensor_data?location=B1.01&period=24h|1w|1m
app.get('/api/sensor_data', async (c) => {
  const location = c.req.query('location')
  const period   = c.req.query('period') ?? '24h'

  const periodMs: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '1w':   7 * 24 * 60 * 60 * 1000,
    '1m':  30 * 24 * 60 * 60 * 1000,
  }
  const cutoff = new Date(Date.now() - (periodMs[period] ?? periodMs['24h'])).toISOString()

  const conditions = [gte(sensorData.timestamp, cutoff)]
  if (location) conditions.push(eq(sensorData.location, location))

  const data = await db.select().from(sensorData)
    .where(and(...conditions))
    .orderBy(asc(sensorData.timestamp))

  return c.json(data)
})

// GET /api/learning_facilities?year=2024
app.get('/api/learning_facilities', async (c) => {
  const year = c.req.query('year')
  const data = year
    ? await db.select().from(learningFacilities).where(eq(learningFacilities.year, parseInt(year)))
    : await db.select().from(learningFacilities).orderBy(desc(learningFacilities.year))
  return c.json(data)
})

 app.post("/admin/import", async (c) => {
  if (!requireAuth(c)) return c.json({ success: false, message: 'Nicht autorisiert' }, 401)

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



/* app.delete("/admin/clear", async (c) => {
  await db.delete(mensaMenu);
  return c.json({ success: true, message: "Alle Einträge gelöscht" });
}); */

// ============================================
// ADMIN: Benutzerverwaltung
// Dünne Wrapper um das Better-Auth admin-Plugin. Die Autorisierung macht das
// Plugin selbst anhand der Session (adminRoles: ['admin']); requireAuth davor
// spart nur den Roundtrip und liefert eine einheitliche Fehlermeldung.
// ============================================

// GET /api/admin/users — alle User auflisten (nur admin)
app.get('/api/admin/users', async (c) => {
  if (!requireAuth(c, 'admin')) return c.json({ message: 'Nicht autorisiert' }, 401)

  const result = await auth.api.listUsers({
    query: { limit: 500 },
    headers: c.req.raw.headers,
  })

  return c.json(result.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u as { role?: string | null }).role ?? 'mitarbeiterin',
    banned: (u as { banned?: boolean | null }).banned ?? false,
  })))
})

// POST /api/admin/users — User anlegen und Einladung verschicken (nur admin)
app.post('/api/admin/users', async (c) => {
  if (!requireAuth(c, 'admin')) return c.json({ message: 'Nicht autorisiert' }, 401)

  const { name, email, role } = await c.req.json()
  if (!name || !email || !role) return c.json({ message: 'name, email und role erforderlich' }, 400)
  if (role !== 'admin' && role !== 'mitarbeiterin') return c.json({ message: 'Unbekannte Rolle' }, 400)
  if (!String(email).toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
    return c.json({ message: `Nur Adressen auf ${ALLOWED_EMAIL_DOMAIN} sind zugelassen.` }, 400)
  }

  // Der Account bekommt ein zufälliges Passwort, das niemand kennt. Gesetzt wird
  // es erst über den Einladungslink — derselbe Mechanismus wie beim Reset.
  const throwawayPassword = randomBytes(32).toString('base64url')

  try {
    await auth.api.createUser({
      body: { name, email, password: throwawayPassword, role },
      headers: c.req.raw.headers,
    })
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    if (status === 422) return c.json({ message: 'E-Mail bereits vergeben' }, 409)
    throw err
  }

  // Absolute URL, weil Frontend (5173) und API (3000) in der Entwicklung
  // getrennte Origins sind. redirectTo entscheidet in auth.ts außerdem über
  // Einladungs- statt Reset-Wortlaut.
  const appUrl = process.env.APP_URL ?? 'http://localhost:5173'
  await auth.api.requestPasswordReset({
    body: { email, redirectTo: `${appUrl}/accept-invite` },
  })

  return c.json({ success: true })
})

// DELETE /api/admin/users/:id — User löschen (nur admin)
app.delete('/api/admin/users/:id', async (c) => {
  const current = requireAuth(c, 'admin')
  if (!current) return c.json({ message: 'Nicht autorisiert' }, 401)

  const id = c.req.param('id')
  if (current.id === id) return c.json({ message: 'Eigenen Account nicht löschbar' }, 400)

  await auth.api.removeUser({
    body: { userId: id },
    headers: c.req.raw.headers,
  })
  return c.json({ success: true })
})

// POST /api/admin/users/:id/role — Rolle ändern (nur admin)
app.post('/api/admin/users/:id/role', async (c) => {
  const current = requireAuth(c, 'admin')
  if (!current) return c.json({ message: 'Nicht autorisiert' }, 401)

  const id = c.req.param('id')
  const { role } = await c.req.json()
  if (role !== 'admin' && role !== 'mitarbeiterin') return c.json({ message: 'Unbekannte Rolle' }, 400)
  if (current.id === id) return c.json({ message: 'Eigene Rolle nicht änderbar' }, 400)

  await auth.api.setRole({
    body: { userId: id, role },
    headers: c.req.raw.headers,
  })
  return c.json({ success: true })
})


const __dirname = path.dirname(fileURLToPath(import.meta.url))

// In der Entwicklung (tsx auf src/) liegen die Migrationen unter
// src/drizzle/migrations; im Container kopiert das Dockerfile sie nach
// dist/drizzle. Vorher zeigte der Pfad im Dev-Modus auf ein veraltetes
// server/drizzle, sodass neue Migrationen lokal nie angewendet wurden.
const migrationsFolder = [
  path.join(__dirname, 'drizzle/migrations'),
  path.join(__dirname, '../drizzle'),
].find((dir) => existsSync(path.join(dir, 'meta', '_journal.json')))

if (!migrationsFolder) throw new Error('Migrationsordner nicht gefunden')
await migrate(db, { migrationsFolder })
console.log(`[migrate] Migrations angewendet aus ${migrationsFolder}`)

serve({
  fetch: app.fetch,
  port: 3000,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
  startScheduler()
})

export default app;