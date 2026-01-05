import { db } from './drizzle/db.js'
import { commuteStats } from './drizzle/schema.js'

// Semester mapping: 1 = Wintersemester, 2 = Sommersemester
const WINTERSEMESTER = 1
const SOMMERSEMESTER = 2

// Categories
const CATEGORIES = ['gesamt', 'studierende', 'mitarbeiter'] as const

interface CommuteRecord {
  year: number
  month: number
  category: string
  mode: string
  percentage: number
  personCount: number
}

function generateCommuteData(
  year: number,
  semester: number,
  baseData: { mode: string; studentCount: number; staffCount: number }[]
): CommuteRecord[] {
  const records: CommuteRecord[] = []
  
  // Calculate totals
  const totalStudents = baseData.reduce((sum, d) => sum + d.studentCount, 0)
  const totalStaff = baseData.reduce((sum, d) => sum + d.staffCount, 0)
  const totalAll = totalStudents + totalStaff

  for (const item of baseData) {
    const totalCount = item.studentCount + item.staffCount
    
    // Gesamt (total)
    records.push({
      year,
      month: semester,
      category: 'gesamt',
      mode: item.mode,
      percentage: Math.round((totalCount / totalAll) * 100),
      personCount: totalCount,
    })
    
    // Studierende (students)
    records.push({
      year,
      month: semester,
      category: 'studierende',
      mode: item.mode,
      percentage: Math.round((item.studentCount / totalStudents) * 100),
      personCount: item.studentCount,
    })
    
    // Mitarbeiter (staff)
    records.push({
      year,
      month: semester,
      category: 'mitarbeiter',
      mode: item.mode,
      percentage: Math.round((item.staffCount / totalStaff) * 100),
      personCount: item.staffCount,
    })
  }
  
  return records
}

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.delete(commuteStats)

  const commuteData: CommuteRecord[] = []

  // WS 2024/25 (current semester)
  commuteData.push(...generateCommuteData(2024, WINTERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 350, staffCount: 50 },
    { mode: 'Fahrrad', studentCount: 620, staffCount: 80 },
    { mode: 'Auto', studentCount: 980, staffCount: 220 },
    { mode: 'ÖPNV', studentCount: 3200, staffCount: 300 },
  ]))

  // SS 2025
  commuteData.push(...generateCommuteData(2025, SOMMERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 450, staffCount: 70 },
    { mode: 'Fahrrad', studentCount: 920, staffCount: 130 },
    { mode: 'Auto', studentCount: 850, staffCount: 200 },
    { mode: 'ÖPNV', studentCount: 2950, staffCount: 280 },
  ]))

  // WS 2023/24
  commuteData.push(...generateCommuteData(2023, WINTERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 320, staffCount: 45 },
    { mode: 'Fahrrad', studentCount: 550, staffCount: 70 },
    { mode: 'Auto', studentCount: 1100, staffCount: 240 },
    { mode: 'ÖPNV', studentCount: 3100, staffCount: 290 },
  ]))

  // SS 2024
  commuteData.push(...generateCommuteData(2024, SOMMERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 400, staffCount: 60 },
    { mode: 'Fahrrad', studentCount: 820, staffCount: 110 },
    { mode: 'Auto', studentCount: 950, staffCount: 210 },
    { mode: 'ÖPNV', studentCount: 3000, staffCount: 285 },
  ]))

  // WS 2022/23
  commuteData.push(...generateCommuteData(2022, WINTERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 280, staffCount: 40 },
    { mode: 'Fahrrad', studentCount: 420, staffCount: 55 },
    { mode: 'Auto', studentCount: 1250, staffCount: 260 },
    { mode: 'ÖPNV', studentCount: 3050, staffCount: 280 },
  ]))

  // SS 2023
  commuteData.push(...generateCommuteData(2023, SOMMERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 360, staffCount: 55 },
    { mode: 'Fahrrad', studentCount: 720, staffCount: 95 },
    { mode: 'Auto', studentCount: 1050, staffCount: 225 },
    { mode: 'ÖPNV', studentCount: 3020, staffCount: 275 },
  ]))

  await db.insert(commuteStats).values(commuteData)

  console.log(`✅ Inserted ${commuteData.length} commute stats records`)
  console.log('📊 Data structure:')
  console.log('   - 6 semesters (WS 2022/23 to SS 2025)')
  console.log('   - 3 categories per semester (gesamt, studierende, mitarbeiter)')
  console.log('   - 4 transport modes per category')
  console.log('🎉 Seeding complete!')
}

seed().catch(console.error)
