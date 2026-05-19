import { db } from './drizzle/db.js'
import {
  commuteStats,
  emissions,
  buildingRating,
  peopleStats,
  studentDemographics,
  studentDepartment,
  staffDemographics,
  sustainabilityGoals,
  energyMix,
  energyConsumption,
  heatingMix,
  fossilFuels,
  waste,
  mensaMealStats,
  mensaMenu,
  learningFacilities,
  airQuality,
} from './drizzle/schema.js'

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

interface BuildingRatingRecord {
  year: number
  month: number
  score: number
  co2PerPerson?: number | null
}

interface PeopleStatsRecord {
  year: number
  month: number
  students: number
  employees: number
  professors: number
}

interface StudentDemographicsRecord {
  year: number
  qualification: string
  gender: string
  count: number
}

interface StaffDemographicsRecord {
  year: number
  department: string
  gender: string
  count: number
}

interface MensaMealStats {
  id: number
  date: number
  category: string
  count: number
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function isoDate(y: number, m: number, d: number) {
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function generateCommuteData(
  year: number,
  semester: number,
  baseData: { mode: string; studentCount: number; staffCount: number }[],
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

  // Seasonal variation (fixed logic)
  const winter = month === 12 || month <= 2
  const summer = month >= 6 && month <= 8
  const seasonalFactor = winter ? 1.3 : summer ? 0.7 : 1.0

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const weekendFactor = isWeekend ? 0.3 : 1.0

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

function generateMonthlyEnergyConsumption(year: number, month: number) {
  const base = { Strom: 120000, Gas: 80000, Fernwärme: 60000 } as const

  const winter = month === 12 || month <= 2
  const summer = month >= 6 && month <= 8
  const seasonalFactor = winter ? 1.25 : summer ? 0.85 : 1.0

  return (Object.keys(base) as Array<keyof typeof base>).map((type) => ({
    year,
    month,
    day: null as number | null,
    type,
    valueKwh: Math.round(base[type] * seasonalFactor * (0.9 + Math.random() * 0.2)),
  }))
}

async function seed() {
  console.log('🌱 Seeding database...')

  // Falls db.transaction bei deinem Driver nicht existiert, sag kurz Bescheid – dann machen wir’s ohne.
  await db.transaction(async (tx) => {
    // ============================================
    // CLEAR EXISTING DATA
    // ============================================
    await tx.delete(commuteStats)
    await tx.delete(emissions)
    await tx.delete(buildingRating)
    await tx.delete(peopleStats)
    await tx.delete(studentDemographics)
    await tx.delete(staffDemographics)
    await tx.delete(sustainabilityGoals)
    await tx.delete(energyMix)
    await tx.delete(energyConsumption)
    await tx.delete(heatingMix)
    await tx.delete(fossilFuels)
    await tx.delete(waste)
    await tx.delete(mensaMealStats)
    await tx.delete(mensaMenu)
    await tx.delete(learningFacilities)
    await tx.delete(studentDepartment)
    await tx.delete(airQuality)

    // ============================================
    // COMMUTE DATA
    // ============================================
    const commuteData: CommuteRecord[] = []

    commuteData.push(
      ...generateCommuteData(2024, WINTERSEMESTER, [
        { mode: 'zu Fuß', studentCount: 350, staffCount: 50 },
        { mode: 'Fahrrad', studentCount: 620, staffCount: 80 },
        { mode: 'Auto', studentCount: 980, staffCount: 220 },
        { mode: 'ÖPNV', studentCount: 3200, staffCount: 300 },
      ]),
    )

    commuteData.push(
      ...generateCommuteData(2025, SOMMERSEMESTER, [
        { mode: 'zu Fuß', studentCount: 450, staffCount: 70 },
        { mode: 'Fahrrad', studentCount: 920, staffCount: 130 },
        { mode: 'Auto', studentCount: 850, staffCount: 200 },
        { mode: 'ÖPNV', studentCount: 2950, staffCount: 280 },
      ]),
    )

    commuteData.push(
      ...generateCommuteData(2023, WINTERSEMESTER, [
        { mode: 'zu Fuß', studentCount: 320, staffCount: 45 },
        { mode: 'Fahrrad', studentCount: 550, staffCount: 70 },
        { mode: 'Auto', studentCount: 1100, staffCount: 240 },
        { mode: 'ÖPNV', studentCount: 3100, staffCount: 290 },
      ]),
    )

    commuteData.push(
      ...generateCommuteData(2024, SOMMERSEMESTER, [
        { mode: 'zu Fuß', studentCount: 400, staffCount: 60 },
        { mode: 'Fahrrad', studentCount: 820, staffCount: 110 },
        { mode: 'Auto', studentCount: 950, staffCount: 210 },
        { mode: 'ÖPNV', studentCount: 3000, staffCount: 285 },
      ]),
    )

    commuteData.push(
      ...generateCommuteData(2022, WINTERSEMESTER, [
        { mode: 'zu Fuß', studentCount: 280, staffCount: 40 },
        { mode: 'Fahrrad', studentCount: 420, staffCount: 55 },
        { mode: 'Auto', studentCount: 1250, staffCount: 260 },
        { mode: 'ÖPNV', studentCount: 3050, staffCount: 280 },
      ]),
    )

    commuteData.push(
      ...generateCommuteData(2023, SOMMERSEMESTER, [
        { mode: 'zu Fuß', studentCount: 360, staffCount: 55 },
        { mode: 'Fahrrad', studentCount: 720, staffCount: 95 },
        { mode: 'Auto', studentCount: 1050, staffCount: 225 },
        { mode: 'ÖPNV', studentCount: 3020, staffCount: 275 },
      ]),
    )

    await tx.insert(commuteStats).values(commuteData)

    // ============================================
    // EMISSIONS DATA
    // ============================================
    const emissionsData: EmissionsRecord[] = []
    for (const year of [2024, 2025]) {
      const maxMonth = year === 2025 ? 6 : 12
      for (let month = 1; month <= maxMonth; month++) {
        emissionsData.push(...generateEmissionsData(year, month))
      }
    }
    await tx.insert(emissions).values(emissionsData)

    // ============================================
    // BUILDING RATING DATA
    // ============================================
    const buildingRatingData: BuildingRatingRecord[] = []
    for (const year of [2024, 2025]) {
      const maxMonth = year === 2025 ? 6 : 12
      for (let month = 1; month <= maxMonth; month++) {
        buildingRatingData.push({
          year,
          month,
          score: randomInt(1, 100),
          co2PerPerson: round1(5 + Math.random() * 20),
        })
      }
    }
    await tx.insert(buildingRating).values(buildingRatingData)

    // ============================================
    // PEOPLE STATS DATA (monthly)
    // ============================================
    const peopleStatsData: PeopleStatsRecord[] = []
    for (const year of [2024, 2025]) {
      const maxMonth = year === 2025 ? 6 : 12
      for (let month = 1; month <= maxMonth; month++) {
        const studentsBase = 9000
        const employeesBase = 750
        const professorsBase = 180

        const trend = year === 2025 ? 1.02 : 1.0
        const seasonal = month >= 10 || month <= 2 ? 1.03 : 0.99

        const students = Math.round(studentsBase * trend * seasonal * (0.97 + Math.random() * 0.06))
        const employees = Math.round(employeesBase * trend * (0.97 + Math.random() * 0.06))
        const professors = Math.round(professorsBase * trend * (0.97 + Math.random() * 0.06))

        peopleStatsData.push({ year, month, students, employees, professors })
      }
    }
    await tx.insert(peopleStats).values(peopleStatsData)



    // ============================================
    // SUSTAINABILITY GOALS
    // ============================================
    await tx.insert(sustainabilityGoals).values([
      {
        title: 'CO₂-Emissionen senken',
        description: 'Reduktion der standortbezogenen Emissionen pro Kopf.',
        targetYear: 2030,
        targetValue: 40,
        unit: '%',
        isCompleted: 0,
      },
      {
        title: 'Erneuerbare Energien erhöhen',
        description: 'Anteil erneuerbarer Energien am Strommix erhöhen.',
        targetYear: 2028,
        targetValue: 60,
        unit: '%',
        isCompleted: 0,
      },
      {
        title: 'Abfall reduzieren',
        description: 'Restmüllaufkommen senken durch bessere Trennung und Vermeidung.',
        targetYear: 2027,
        targetValue: 15,
        unit: '%',
        isCompleted: 0,
      },
      {
        title: 'Mensa-Angebot nachhaltiger',
        description: 'Mehr vegane/vegetarische Optionen und geringerer CO₂-Fußabdruck.',
        targetYear: 2026,
        targetValue: 50,
        unit: '% veg/veg',
        isCompleted: 0,
      },
    ])

    // ============================================
    // ELECTRICITY MIX (yearly)
    // ============================================
    const energyMixRows = [
      { year: 2024, source: 'Solar', percentage: 18 },
      { year: 2024, source: 'Wind', percentage: 22 },
      { year: 2024, source: 'Wasserkraft', percentage: 10 },
      { year: 2024, source: 'Biomasse', percentage: 8 },
      { year: 2024, source: 'Erdgas', percentage: 25 },
      { year: 2024, source: 'Kohle', percentage: 17 },

      { year: 2025, source: 'Solar', percentage: 20 },
      { year: 2025, source: 'Wind', percentage: 24 },
      { year: 2025, source: 'Wasserkraft', percentage: 10 },
      { year: 2025, source: 'Biomasse', percentage: 9 },
      { year: 2025, source: 'Erdgas', percentage: 23 },
      { year: 2025, source: 'Kohle', percentage: 14 },
    ]
    await tx.insert(energyMix).values(energyMixRows)

    // ============================================
    // ENERGY CONSUMPTION (monthly)
    // ============================================
    const energyConsumptionRows: {
      year: number
      month: number
      day?: number | null
      type: string
      valueKwh: number
    }[] = []

    for (const year of [2024, 2025]) {
      for (let month = 1; month <= 12; month++) {
        energyConsumptionRows.push(...generateMonthlyEnergyConsumption(year, month))
      }
    }

    await tx.insert(energyConsumption).values(energyConsumptionRows)

    // ============================================
    // HEATING MIX (yearly)
    // ============================================
    const heatingMixRows = [
      { year: 2024, source: 'Müll-KWK', percentage: 25 },
      { year: 2024, source: 'Klärschlamm', percentage: 8 },
      { year: 2024, source: 'Solar', percentage: 5 },
      { year: 2024, source: 'Wärmepumpe', percentage: 12 },
      { year: 2024, source: 'Gas-KWK', percentage: 35 },
      { year: 2024, source: 'Biomasse', percentage: 15 },

      { year: 2025, source: 'Müll-KWK', percentage: 24 },
      { year: 2025, source: 'Klärschlamm', percentage: 9 },
      { year: 2025, source: 'Solar', percentage: 6 },
      { year: 2025, source: 'Wärmepumpe', percentage: 14 },
      { year: 2025, source: 'Gas-KWK', percentage: 32 },
      { year: 2025, source: 'Biomasse', percentage: 15 },
    ]
    await tx.insert(heatingMix).values(heatingMixRows)

    // ============================================
    // FOSSIL FUELS (yearly)
    // ============================================
    const fossilFuelRows = [
      { year: 2024, type: 'Erdöl', valueTons: round1(12 + Math.random() * 6) },
      { year: 2024, type: 'Erdgas', valueTons: round1(30 + Math.random() * 10) },
      { year: 2025, type: 'Erdöl', valueTons: round1(10 + Math.random() * 6) },
      { year: 2025, type: 'Erdgas', valueTons: round1(28 + Math.random() * 10) },
    ]
    await tx.insert(fossilFuels).values(fossilFuelRows)

    // ============================================
    // WASTE (weekly)
    // ============================================
    const wasteRows: { year: number; week: number; category: string; valueTons: number }[] = []
    const wasteCategories = ['Papier', 'Rest', 'Bio', 'Gelber Sack']

    function generateWasteYear(year: number) {
      for (let week = 1; week <= 52; week++) {
        for (const cat of wasteCategories) {
          const base = cat === 'Rest' ? 1.2 : cat === 'Papier' ? 0.9 : cat === 'Gelber Sack' ? 0.7 : 0.6
          wasteRows.push({
            year,
            week,
            category: cat,
            valueTons: Math.round(base * (0.7 + Math.random() * 0.6) * 100) / 100,
          })
        }
      }
    }

    generateWasteYear(2024)
    generateWasteYear(2025)

    await tx.insert(waste).values(wasteRows)

    // ============================================
    // MENSA (daily)
    // ============================================
    const mensaStatsRows: { date: string; category: string; count: number }[] = []
    const mensaMenuRows: {
      date: string
      name: string
      category: string
      allergens?: string | null
      priceStudent: number
      priceStaff: number
      co2Grams: number
    }[] = []

    function generateMensaForMonth(year: number, month: number) {
      const daysInMonth = new Date(year, month, 0).getDate()

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = isoDate(year, month, day)
        const weekday = new Date(year, month - 1, day).getDay()
        if (weekday === 0 || weekday === 6) continue // Wochenende skip

        const vegan = 120 + randomInt(0, 60)
        const veg = 180 + randomInt(0, 80)
        const meat = 220 + randomInt(0, 100)

        mensaStatsRows.push(
          { date: dateStr, category: 'vegan', count: vegan },
          { date: dateStr, category: 'vegetarisch', count: veg },
          { date: dateStr, category: 'fleisch', count: meat },
        )

        mensaMenuRows.push(
          {
            date: dateStr,
            name: 'Veganer Eintopf',
            category: 'vegan',
            allergens: 'Gl',
            priceStudent: 2.7,
            priceStaff: 4.2,
            co2Grams: randomInt(250, 500),
          },
          {
            date: dateStr,
            name: 'Käsespätzle',
            category: 'vegetarisch',
            allergens: 'Gl, La, Ei',
            priceStudent: 3.1,
            priceStaff: 4.7,
            co2Grams: randomInt(500, 850),
          },
          {
            date: dateStr,
            name: 'Hähnchen mit Reis',
            category: 'fleisch',
            allergens: null,
            priceStudent: 3.5,
            priceStaff: 5.2,
            co2Grams: randomInt(900, 1600),
          },
        )
      }
    }

    for (const year of [2024, 2025]) {
      const maxMonth = year === 2025 ? 6 : 12
      for (let month = 1; month <= maxMonth; month++) generateMensaForMonth(year, month)
    }

    await tx.insert(mensaMealStats).values(mensaStatsRows)
    await tx.insert(mensaMenu).values(mensaMenuRows)

    // ============================================
    // LEARNING FACILITIES (yearly)
    // ============================================
    const learningRows: {
      year: number
      consultations?: number | null
      selfStudyPlaces?: number | null
      researchProjects?: number | null
      studentAssistants?: number | null
      satisfactionPercent?: number | null
      surveyResponses?: number | null
      totalStudents?: number | null
    }[] = []

    for (const year of [2022, 2023, 2024, 2025]) {
      const totalStudents =
        year === 2025 ? 9200 : year === 2024 ? 9000 : year === 2023 ? 8800 : 8600
      const surveyResponses = 250 + randomInt(0, 250)
      const satisfactionPercent = round1(65 + Math.random() * 25) // 65–90

      learningRows.push({
        year,
        consultations: 40 + randomInt(0, 25),
        selfStudyPlaces: 300 + randomInt(0, 120),
        researchProjects: 18 + randomInt(0, 12),
        studentAssistants: 60 + randomInt(0, 40),
        satisfactionPercent,
        surveyResponses,
        totalStudents,
      })
    }

    await tx.insert(learningFacilities).values(learningRows)

    // ============================================
    // STUDENT DEMOGRAPHICS
    // ============================================
    const qualifications = ['Allgemeine Hochschulreife', 'Fachhochschulreife', 'Berufliche Qualifikation']
    const genders = ['männlich', 'weiblich', 'divers']
    const studentDemographicsRows: { year: number; qualification: string; gender: string; count: number }[] = []

    for (const year of [2023, 2024, 2025]) {
      for (const qualification of qualifications) {
        const base = qualification === 'Allgemeine Hochschulreife' ? 2800 : qualification === 'Fachhochschulreife' ? 1600 : 400
        for (const gender of genders) {
          const genderFactor = gender === 'männlich' ? 0.52 : gender === 'weiblich' ? 0.46 : 0.02
          studentDemographicsRows.push({ year, qualification, gender, count: Math.round(base * genderFactor * (0.95 + Math.random() * 0.1)) })
        }
      }
    }

    await tx.insert(studentDemographics).values(studentDemographicsRows)

    // ============================================
    // STAFF DEMOGRAPHICS
    // ============================================
    const departments = ['Fachbereich Wirtschaft', 'Technik', 'Gestaltung', 'Zentrale Verwaltung & Services']
    const staffDemographicsRows: { year: number; department: string; gender: string; count: number }[] = []

    for (const year of [2023, 2024, 2025]) {
      for (const department of departments) {
        const base = department === 'Zentrale Verwaltung & Services' ? 80 : department === 'Fachbereich Wirtschaft' ? 60 : 45
        for (const gender of genders) {
          const genderFactor = gender === 'männlich' ? 0.50 : gender === 'weiblich' ? 0.48 : 0.02
          staffDemographicsRows.push({ year, department, gender, count: Math.round(base * genderFactor * (0.95 + Math.random() * 0.1)) })
        }
      }
    }

    await tx.insert(staffDemographics).values(staffDemographicsRows)

    // ============================================
    // STUDENT DEPARTMENT
    // ============================================
    const studentDepartments = [
      'Fachbereich Wirtschaft',
      'Technik',
      'Gestaltung',
      'Architektur & Bauingenieurwesen',
    ]
    const studentDepartmentRows: { year: number; department: string; gender: string; count: number }[] = []

    for (const year of [2023, 2024, 2025]) {
      for (const department of studentDepartments) {
        const base =
          department === 'Fachbereich Wirtschaft' ? 1800
          : department === 'Technik' ? 2200
          : department === 'Gestaltung' ? 900
          : 1100
        for (const gender of genders) {
          const genderFactor = gender === 'männlich' ? 0.54 : gender === 'weiblich' ? 0.44 : 0.02
          studentDepartmentRows.push({
            year,
            department,
            gender,
            count: Math.round(base * genderFactor * (0.95 + Math.random() * 0.1)),
          })
        }
      }
    }

    await tx.insert(studentDepartment).values(studentDepartmentRows)

    // ============================================
    // LOG SUMMARY (inside transaction is fine)
    // ============================================
    console.log(`✅ Inserted ${commuteData.length} commute stats records`)
    console.log(`✅ Inserted ${emissionsData.length} emissions records`)
    console.log(`✅ Inserted ${buildingRatingData.length} building rating records`)
    console.log(`✅ Inserted ${peopleStatsData.length} people stats records`)
    console.log(`✅ Inserted sustainability goals`)
    console.log(`✅ Inserted ${energyMixRows.length} energy mix records`)
    console.log(`✅ Inserted ${energyConsumptionRows.length} energy consumption records`)
    console.log(`✅ Inserted ${heatingMixRows.length} heating mix records`)
    console.log(`✅ Inserted ${fossilFuelRows.length} fossil fuels records`)
    console.log(`✅ Inserted ${wasteRows.length} waste records`)
    console.log(`✅ Inserted ${mensaStatsRows.length} mensa meal stats records`)
    console.log(`✅ Inserted ${mensaMenuRows.length} mensa menu records`)
    console.log(`✅ Inserted ${learningRows.length} learning facilities records`)
    console.log(`✅ Inserted ${studentDemographicsRows.length} student demographics records`)
    console.log(`✅ Inserted ${staffDemographicsRows.length} staff demographics records`)
    console.log(`✅ Inserted ${studentDepartmentRows.length} student department records`)

    // ============================================
    // AIR QUALITY (every 30 min for last 48h)
    // ============================================
    const airQualityRows: { timestamp: string; temperature: number; co2: number; moisture: number; voc: number }[] = []
    const now = new Date('2026-04-19T16:00:00')
    for (let i = 95; i >= 0; i--) {
      const ts = new Date(now.getTime() - i * 30 * 60 * 1000)
      const hour = ts.getHours()
      // Tagesrhythmus: morgens CO2 steigt, nachts sinkt
      const dayFactor = Math.sin((hour - 6) * Math.PI / 12) * 0.5 + 0.5 // 0–1
      airQualityRows.push({
        timestamp: ts.toISOString().slice(0, 16),
        temperature: Math.round((22 + dayFactor * 5.5 + (Math.random() - 0.5) * 1.2) * 10) / 10,
        co2: Math.round(420 + dayFactor * 380 + (Math.random() - 0.5) * 60),
        moisture: Math.round((55 + (1 - dayFactor) * 8 + (Math.random() - 0.5) * 4) * 10) / 10,
        voc: Math.round(80 + dayFactor * 320 + (Math.random() - 0.5) * 50),
        pm25: Math.round((4 + dayFactor * 18 + (Math.random() - 0.5) * 3) * 10) / 10,
        pm10: Math.round((10 + dayFactor * 35 + (Math.random() - 0.5) * 6) * 10) / 10,
      })
    }
    await tx.insert(airQuality).values(airQualityRows)
    console.log(`✅ Inserted ${airQualityRows.length} air quality records`)
  })

  console.log('🎉 Seeding complete!')
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exitCode = 1
})