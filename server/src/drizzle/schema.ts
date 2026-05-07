import { int, real, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

// ============================================
// USERS / AUTH
// ============================================

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  passwordHash: text(), // null until user sets password via invite
  role: text().notNull().default("mitarbeiterin"), // 'admin' | 'mitarbeiterin'
  isActive: int().notNull().default(0), // 0 = invited, 1 = active
  inviteToken: text(),
  resetToken: text(),
  tokenExpiresAt: int(), // Unix timestamp (seconds)
});

// ============================================
// PEOPLE & DEMOGRAPHICS
// ============================================

export const peopleStats = sqliteTable("people_stats", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  students: int().notNull(),
  employees: int().notNull(),
  professors: int().notNull(),
}, (table) => [
  index("people_stats_time_idx").on(table.year),
]);

export const studentDemographics = sqliteTable("student_demographics", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  qualification: text().notNull(), // 'Allgemeine Hochschulreife', 'Fachhochschulreife', 'Berufliche Qualifikation'
  gender: text().notNull(), // 'männlich', 'weiblich', 'divers'
  count: int().notNull(),
}, (table) => [
  index("student_demographics_year_idx").on(table.year),
]);

export const studentDepartment = sqliteTable("student_department", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  department: text().notNull(),
  gender: text().notNull(), // 'männlich', 'weiblich', 'divers'
  count: int().notNull(),
}, (table) => [
  index("student_department_year_idx").on(table.year),
]);

export const staffDemographics = sqliteTable("staff_demographics", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  department: text().notNull(), // 'Fachbereich Wirtschaft', 'Technik', 'Gestaltung', 'Zentrale Verwaltung & Services'
  gender: text().notNull(), // 'männlich', 'weiblich', 'divers'
  count: int().notNull(),
}, (table) => [
  index("staff_demographics_year_idx").on(table.year),
]);

// ============================================
// EMISSIONS & ENVIRONMENT
// ============================================

export const emissions = sqliteTable("emissions", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  month: int().notNull(),
  day: int(), // optional, for daily granularity
  category: text().notNull(), // 'gesamt', 'strom', 'heizung', 'mobilität'
  valueCo2Kg: real().notNull(),
}, (table) => [
  index("emissions_time_idx").on(table.year, table.month),
  index("emissions_category_idx").on(table.category),
]);

export const buildingRating = sqliteTable("building_rating", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  month: int().notNull(),
  score: int().notNull(), // 0-100
  co2PerPerson: real(), // CO2-Emissionen pro Person im Monatsdurchschnitt
}, (table) => [
  index("building_rating_time_idx").on(table.year, table.month),
]);

// ============================================
// SUSTAINABILITY GOALS
// ============================================

export const goalLogs = sqliteTable("goal_logs", {
  id: int().primaryKey({ autoIncrement: true }),
  action: text().notNull(), // 'created' | 'deleted'
  goalTitle: text().notNull(),
  username: text().notNull(),
  timestamp: int().notNull(), // Unix timestamp (seconds)
});

export const sustainabilityGoals = sqliteTable("sustainability_goals", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  targetYear: int().notNull(),
  targetValue: real(),
  unit: text(),
  isCompleted: int().default(0), // 0 = false, 1 = true (SQLite boolean)
});

// ============================================
// ENERGY
// ============================================

export const energyMix = sqliteTable("energy_mix", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  source: text().notNull(), // 'Solar', 'Wind', 'Wasserkraft', 'Kohle', 'Erdgas', 'Biomasse'
  percentage: real().notNull(),
}, (table) => [
  index("energy_mix_year_idx").on(table.year),
]);

export const energyConsumption = sqliteTable("energy_consumption", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  month: int().notNull(),
  day: int(), // optional for daily data
  type: text().notNull(), // 'Strom', 'Gas', 'Fernwärme'
  valueKwh: real().notNull(),
}, (table) => [
  index("energy_consumption_time_idx").on(table.year, table.month),
  index("energy_consumption_type_idx").on(table.type),
]);

export const heatingMix = sqliteTable("heating_mix", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  source: text().notNull(), // 'Müll-KWK', 'Klärschlamm', 'Solar', 'Wärmepumpe', 'Gas-KWK', 'Biomasse'
  percentage: real().notNull(),
}, (table) => [
  index("heating_mix_year_idx").on(table.year),
]);

export const fossilFuels = sqliteTable("fossil_fuels", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  type: text().notNull(), // 'Erdöl', 'Erdgas'
  valueTons: real().notNull(),
}, (table) => [
  index("fossil_fuels_year_idx").on(table.year),
]);

// ============================================
// WASTE
// ============================================

export const waste = sqliteTable("waste", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  week: int().notNull(), // 1-52 (ISO week number)
  category: text().notNull(), // 'Papier', 'Rest', 'Bio', 'Gelber Sack'
  valueTons: real().notNull(),
}, (table) => [
  index("waste_time_idx").on(table.year, table.week),
  index("waste_category_idx").on(table.category),
]);

// ============================================
// MOBILITY / COMMUTE
// ============================================

export const commuteStats = sqliteTable("commute_stats", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  month: int().notNull(), // Used as semester: 1=WS, 2=SS
  category: text().notNull(), // 'gesamt', 'studierende', 'mitarbeiter'
  mode: text().notNull(), // 'zu Fuß', 'Fahrrad', 'Auto', 'ÖPNV'
  percentage: real().notNull(),
  personCount: int().notNull(),
}, (table) => [
  index("commute_stats_time_idx").on(table.year, table.month),
  index("commute_stats_category_idx").on(table.category),
]);

// ============================================
// MENSA / CAFETERIA
// ============================================

export const mensaMealStats = sqliteTable("mensa_meal_stats", {
  id: int().primaryKey({ autoIncrement: true }),
  date: text().notNull(), // ISO date string "YYYY-MM-DD"
  category: text().notNull(), // 'vegan', 'vegetarisch', 'fleisch'
  count: int().notNull(),
}, (table) => [
  index("mensa_meal_stats_date_idx").on(table.date),
]);

export const mensaMenu = sqliteTable("mensa_menu", {
  id: int().primaryKey({ autoIncrement: true }),
  date: text().notNull(), // ISO date string "YYYY-MM-DD"
  name: text().notNull(),
  category: text().notNull(), // 'vegan', 'vegetarisch', 'fleisch'
  allergens: text(), // comma-separated list e.g. "Gl, La, Ei"
  priceStudent: real().notNull(),
  priceStaff: real().notNull(),
  co2Grams: int().notNull(),
}, (table) => [
  index("mensa_menu_date_idx").on(table.date),
  index("mensa_menu_category_idx").on(table.category),
]);

// ============================================
// AIR QUALITY
// ============================================

export const airQuality = sqliteTable("air_quality", {
  id: int().primaryKey({ autoIncrement: true }),
  timestamp: text().notNull(), // ISO datetime "YYYY-MM-DDTHH:MM"
  temperature: real().notNull(), // °C
  co2: int().notNull(),          // ppm
  moisture: real().notNull(),    // % relative humidity
  voc: int().notNull(),          // ppb (volatile organic compounds)
  pm25: real().notNull(),        // µg/m³ (Feinstaub PM2.5)
  pm10: real().notNull(),        // µg/m³ (Feinstaub PM10)
}, (table) => [
  index("air_quality_timestamp_idx").on(table.timestamp),
]);

// ============================================
// LEARNING FACILITIES
// ============================================

export const learningFacilities = sqliteTable("learning_facilities", {
  id: int().primaryKey({ autoIncrement: true }),
  year: int().notNull(),
  consultations: int(), // Anzahl der Lehrberatungen
  selfStudyPlaces: int(), // Lernplätze im Selbststudium
  researchProjects: int(), // Forschungsprojekte
  studentAssistants: int(), // Werkstudentenstellen
  satisfactionPercent: real(), // Studierendenzufriedenheit (0-100)
  surveyResponses: int(), // Anzahl Umfrage-Teilnehmer
  totalStudents: int(), // Gesamtzahl Studierende für Prozentberechnung
}, (table) => [
  index("learning_facilities_year_idx").on(table.year),
]);
