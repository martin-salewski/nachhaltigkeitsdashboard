import { db } from './drizzle/db.js'
import { commuteStats, emissions } from './drizzle/schema.js'

// Semester mapping: 1 = Wintersemester, 2 = Sommersemester
const WINTERSEMESTER = 1
const SOMMERSEMESTER = 2

interface CommuteRecord {
  year: number
  month: number
  category: string
  mode: string
  percentage: number
  personCount: number
}

interface EmissionsRecord {
  year: number
  month: number
  day: number
  category: string
  valueCo2Kg: number
}

function generateCommuteData(
  year: number,
  semester: number,
  baseData: { mode: string; studentCount: number; staffCount: number }[]
): CommuteRecord[] {
  const records: CommuteRecord[] = []
  
  const totalStudents = baseData.reduce((sum, d) => sum + d.studentCount, 0)
  const totalStaff = baseData.reduce((sum, d) => sum + d.staffCount, 0)
  const totalAll = totalStudents + totalStaff

  for (const item of baseData) {
    const totalCount = item.studentCount + item.staffCount
    
    records.push({
      year,
      month: semester,
      category: 'gesamt',
      mode: item.mode,
      percentage: Math.round((totalCount / totalAll) * 100),
      personCount: totalCount,
    })
    
    records.push({
      year,
      month: semester,
      category: 'studierende',
      mode: item.mode,
      percentage: Math.round((item.studentCount / totalStudents) * 100),
      personCount: item.studentCount,
    })
    
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

function generateEmissionsData(year: number, month: number): EmissionsRecord[] {
  const records: EmissionsRecord[] = []
  const daysInMonth = new Date(year, month, 0).getDate()
  
  // Base values for different categories (in kg CO2)
  const baseValues = {
    gesamt: 60,
    strom: 25,
    heizung: 20,
    mobilitaet: 15,
  }
  
  // Seasonal variation (higher in winter months)
  const seasonalFactor = [1, 2, 3, 4, 5, 6].includes(month) 
    ? (month <= 2 || month === 12 ? 1.3 : 0.8) // Winter higher
    : (month >= 6 && month <= 8 ? 0.7 : 1.0) // Summer lower
  
  for (let day = 1; day <= daysInMonth; day++) {
    // Weekend factor (lower emissions on weekends)
    const date = new Date(year, month - 1, day)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const weekendFactor = isWeekend ? 0.3 : 1.0
    
    // Random daily variation
    const randomVariation = () => 0.7 + Math.random() * 0.6 // 0.7 to 1.3
    
    for (const [category, baseValue] of Object.entries(baseValues)) {
      const value = baseValue * seasonalFactor * weekendFactor * randomVariation()
      records.push({
        year,
        month,
        day,
        category,
        valueCo2Kg: Math.round(value * 10) / 10,
      })
    }
  }
  
  return records
}

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.delete(commuteStats)
  await db.delete(emissions)

  // ============================================
  // COMMUTE DATA
  // ============================================
  const commuteData: CommuteRecord[] = []

  commuteData.push(...generateCommuteData(2024, WINTERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 350, staffCount: 50 },
    { mode: 'Fahrrad', studentCount: 620, staffCount: 80 },
    { mode: 'Auto', studentCount: 980, staffCount: 220 },
    { mode: 'ÖPNV', studentCount: 3200, staffCount: 300 },
  ]))

  commuteData.push(...generateCommuteData(2025, SOMMERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 450, staffCount: 70 },
    { mode: 'Fahrrad', studentCount: 920, staffCount: 130 },
    { mode: 'Auto', studentCount: 850, staffCount: 200 },
    { mode: 'ÖPNV', studentCount: 2950, staffCount: 280 },
  ]))

  commuteData.push(...generateCommuteData(2023, WINTERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 320, staffCount: 45 },
    { mode: 'Fahrrad', studentCount: 550, staffCount: 70 },
    { mode: 'Auto', studentCount: 1100, staffCount: 240 },
    { mode: 'ÖPNV', studentCount: 3100, staffCount: 290 },
  ]))

  commuteData.push(...generateCommuteData(2024, SOMMERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 400, staffCount: 60 },
    { mode: 'Fahrrad', studentCount: 820, staffCount: 110 },
    { mode: 'Auto', studentCount: 950, staffCount: 210 },
    { mode: 'ÖPNV', studentCount: 3000, staffCount: 285 },
  ]))

  commuteData.push(...generateCommuteData(2022, WINTERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 280, staffCount: 40 },
    { mode: 'Fahrrad', studentCount: 420, staffCount: 55 },
    { mode: 'Auto', studentCount: 1250, staffCount: 260 },
    { mode: 'ÖPNV', studentCount: 3050, staffCount: 280 },
  ]))

  commuteData.push(...generateCommuteData(2023, SOMMERSEMESTER, [
    { mode: 'zu Fuß', studentCount: 360, staffCount: 55 },
    { mode: 'Fahrrad', studentCount: 720, staffCount: 95 },
    { mode: 'Auto', studentCount: 1050, staffCount: 225 },
    { mode: 'ÖPNV', studentCount: 3020, staffCount: 275 },
  ]))

  await db.insert(commuteStats).values(commuteData)
  console.log(`✅ Inserted ${commuteData.length} commute stats records`)

  // ============================================
  // EMISSIONS DATA
  // ============================================
  const emissionsData: EmissionsRecord[] = []
  
  // Generate emissions for 2024 and 2025
  for (const year of [2024, 2025]) {
    const maxMonth = year === 2025 ? 6 : 12 // Only up to June for 2025
    for (let month = 1; month <= maxMonth; month++) {
      emissionsData.push(...generateEmissionsData(year, month))
    }
  }

  await db.insert(emissions).values(emissionsData)
  console.log(`✅ Inserted ${emissionsData.length} emissions records`)

  console.log('📊 Data structure:')
  console.log('   - Commute: 6 semesters, 3 categories, 4 transport modes')
  console.log('   - Emissions: Daily data for 2024-2025, 4 categories')
  console.log('🎉 Seeding complete!')
}

seed().catch(console.error)
