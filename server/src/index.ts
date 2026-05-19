import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { db } from './drizzle/db.js'
import { sendInviteEmail, sendResetEmail } from './services/email.js'
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
  users } from './drizzle/schema.js'
import { eq, and, desc, asc } from 'drizzle-orm'
import { runXmlImport } from './jobs/xmlImport.js'

import { startScheduler } from './cron/scheduler.js'
import exportRoutes from './routes/exportRoutes.js';


const app = new Hono()


/* app.use('/api', exportRoutes); */
// Enable CORS for frontend
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174']
app.use('/*', cors({ origin: allowedOrigins }))

// Simple in-memory rate limiter for login endpoint
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
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
    username: user?.username ?? 'unbekannt',
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
      username: user.username,
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

// GET /api/learning_facilities?year=2024
app.get('/api/learning_facilities', async (c) => {
  const year = c.req.query('year')
  const data = year
    ? await db.select().from(learningFacilities).where(eq(learningFacilities.year, parseInt(year)))
    : await db.select().from(learningFacilities).orderBy(desc(learningFacilities.year))
  return c.json(data)
})

 app.post("/admin/import", async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const jwtSecret = process.env.JWT_SECRET

  if (!token || !jwtSecret) {
    return c.json({ success: false, message: 'Nicht autorisiert' }, 401)
  }
  try {
    jwt.verify(token, jwtSecret)
  } catch {
    return c.json({ success: false, message: 'Ungültiger oder abgelaufener Token' }, 401)
  }

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

// POST /api/login
app.post('/api/login', async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? c.req.header('x-real-ip') ?? 'unknown'
  if (!checkLoginRateLimit(ip)) return c.json({ success: false, message: 'Zu viele Anmeldeversuche. Bitte warte 15 Minuten.' }, 429)

  const body = await c.req.json().catch(() => ({}))
  const { username, password } = body as { username?: string; password?: string }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return c.json({ success: false, message: 'Server nicht konfiguriert' }, 500)

  const [user] = await db.select().from(users).where(eq(users.username, username ?? ''))
  if (!user) return c.json({ success: false, message: 'Ungültige Anmeldedaten' }, 401)

  if (!user.isActive || !user.passwordHash) return c.json({ success: false, message: 'Konto noch nicht aktiviert' }, 401)

  const passwordMatch = await bcrypt.compare(password ?? '', user.passwordHash)
  if (!passwordMatch) return c.json({ success: false, message: 'Ungültige Anmeldedaten' }, 401)

  const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '8h' })
  return c.json({ success: true, token })
})

// Helper: JWT aus Header lesen und prüfen
function requireAuth(c: any, requiredRole?: 'admin' | 'mitarbeiterin') {
  const jwtSecret = process.env.JWT_SECRET
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token || !jwtSecret) return null
  try {
    const payload = jwt.verify(token, jwtSecret) as { userId: number; username: string; role: string }
    if (requiredRole === 'admin' && payload.role !== 'admin') return null
    return payload
  } catch {
    return null
  }
}

// GET /api/admin/users — alle User auflisten (nur admin)
app.get('/api/admin/users', async (c) => {
  if (!requireAuth(c, 'admin')) return c.json({ message: 'Nicht autorisiert' }, 401)
  const allUsers = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
  }).from(users)
  return c.json(allUsers)
})

// POST /api/admin/users — User einladen (nur admin)
app.post('/api/admin/users', async (c) => {
  if (!requireAuth(c, 'admin')) return c.json({ message: 'Nicht autorisiert' }, 401)
  const { username, email, role } = await c.req.json()
  if (!username || !email || !role) return c.json({ message: 'username, email und role erforderlich' }, 400)

  const inviteToken = crypto.randomBytes(32).toString('hex')
  const tokenExpiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 48 // 48h

  try {
    await db.insert(users).values({ username, email, role, isActive: 0, inviteToken, tokenExpiresAt })
  } catch {
    return c.json({ message: 'Benutzername oder E-Mail bereits vergeben' }, 409)
  }

  await sendInviteEmail(email, inviteToken)
  return c.json({ success: true })
})

// DELETE /api/admin/users/:id — User löschen (nur admin)
app.delete('/api/admin/users/:id', async (c) => {
  const auth = requireAuth(c, 'admin')
  if (!auth) return c.json({ message: 'Nicht autorisiert' }, 401)
  const id = Number(c.req.param('id'))
  if (auth.userId === id) return c.json({ message: 'Eigenen Account nicht löschbar' }, 400)
  await db.delete(users).where(eq(users.id, id))
  return c.json({ success: true })
})

// POST /api/auth/accept-invite — Passwort setzen via Einladungstoken
app.post('/api/auth/accept-invite', async (c) => {
  const { token, password } = await c.req.json()
  if (!token || !password) return c.json({ message: 'Token und Passwort erforderlich' }, 400)
  if (typeof password === 'string' && password.length < 8) return c.json({ message: 'Passwort muss mindestens 8 Zeichen lang sein' }, 400)

  const [user] = await db.select().from(users).where(eq(users.inviteToken, token))
  if (!user || !user.tokenExpiresAt || user.tokenExpiresAt < Math.floor(Date.now() / 1000)) {
    return c.json({ message: 'Link ungültig oder abgelaufen' }, 400)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.update(users).set({ passwordHash, isActive: 1, inviteToken: null, tokenExpiresAt: null }).where(eq(users.id, user.id))

  const jwtSecret = process.env.JWT_SECRET!
  const jwtToken = jwt.sign({ userId: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '8h' })
  return c.json({ success: true, token: jwtToken })
})

// POST /api/auth/forgot-password — Reset-Link per Mail senden
app.post('/api/auth/forgot-password', async (c) => {
  const { email } = await c.req.json()
  const [user] = await db.select().from(users).where(eq(users.email, email ?? ''))
  // immer 200 zurückgeben um E-Mail-Enumeration zu verhindern
  if (!user) return c.json({ success: true })

  const resetToken = crypto.randomBytes(32).toString('hex')
  const tokenExpiresAt = Math.floor(Date.now() / 1000) + 60 * 60 // 1h

  await db.update(users).set({ resetToken, tokenExpiresAt }).where(eq(users.id, user.id))
  await sendResetEmail(user.email, resetToken)
  return c.json({ success: true })
})

// POST /api/auth/reset-password — Passwort via Reset-Token neu setzen
app.post('/api/auth/reset-password', async (c) => {
  const { token, password } = await c.req.json()
  if (!token || !password) return c.json({ message: 'Token und Passwort erforderlich' }, 400)
  if (typeof password === 'string' && password.length < 8) return c.json({ message: 'Passwort muss mindestens 8 Zeichen lang sein' }, 400)

  const [user] = await db.select().from(users).where(eq(users.resetToken, token))
  if (!user || !user.tokenExpiresAt || user.tokenExpiresAt < Math.floor(Date.now() / 1000)) {
    return c.json({ message: 'Link ungültig oder abgelaufen' }, 400)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.update(users).set({ passwordHash, resetToken: null, tokenExpiresAt: null }).where(eq(users.id, user.id))
  return c.json({ success: true })
})

serve({
  fetch: app.fetch,
  port: 3000,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
  startScheduler()
})

export default app;