CREATE TABLE `building_rating` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`score` integer NOT NULL,
	`co2PerPerson` real
);
--> statement-breakpoint
CREATE INDEX `building_rating_time_idx` ON `building_rating` (`year`,`month`);--> statement-breakpoint
CREATE TABLE `commute_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`category` text NOT NULL,
	`mode` text NOT NULL,
	`percentage` real NOT NULL,
	`personCount` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `commute_stats_time_idx` ON `commute_stats` (`year`,`month`);--> statement-breakpoint
CREATE INDEX `commute_stats_category_idx` ON `commute_stats` (`category`);--> statement-breakpoint
CREATE TABLE `emissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer,
	`category` text NOT NULL,
	`valueCo2Kg` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `emissions_time_idx` ON `emissions` (`year`,`month`);--> statement-breakpoint
CREATE INDEX `emissions_category_idx` ON `emissions` (`category`);--> statement-breakpoint
CREATE TABLE `energy_consumption` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`day` integer,
	`type` text NOT NULL,
	`valueKwh` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `energy_consumption_time_idx` ON `energy_consumption` (`year`,`month`);--> statement-breakpoint
CREATE INDEX `energy_consumption_type_idx` ON `energy_consumption` (`type`);--> statement-breakpoint
CREATE TABLE `energy_mix` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`source` text NOT NULL,
	`percentage` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `energy_mix_year_idx` ON `energy_mix` (`year`);--> statement-breakpoint
CREATE TABLE `fossil_fuels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`type` text NOT NULL,
	`valueTons` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `fossil_fuels_year_idx` ON `fossil_fuels` (`year`);--> statement-breakpoint
CREATE TABLE `heating_mix` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`source` text NOT NULL,
	`percentage` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `heating_mix_year_idx` ON `heating_mix` (`year`);--> statement-breakpoint
CREATE TABLE `learning_facilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`consultations` integer,
	`selfStudyPlaces` integer,
	`researchProjects` integer,
	`studentAssistants` integer,
	`satisfactionPercent` real,
	`surveyResponses` integer,
	`totalStudents` integer
);
--> statement-breakpoint
CREATE INDEX `learning_facilities_year_idx` ON `learning_facilities` (`year`);--> statement-breakpoint
CREATE TABLE `mensa_meal_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`category` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `mensa_meal_stats_date_idx` ON `mensa_meal_stats` (`date`);--> statement-breakpoint
CREATE TABLE `mensa_menu` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`allergens` text,
	`priceStudent` real NOT NULL,
	`priceStaff` real NOT NULL,
	`co2Grams` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `mensa_menu_date_idx` ON `mensa_menu` (`date`);--> statement-breakpoint
CREATE INDEX `mensa_menu_category_idx` ON `mensa_menu` (`category`);--> statement-breakpoint
CREATE TABLE `people_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`students` integer NOT NULL,
	`employees` integer NOT NULL,
	`professors` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `people_stats_time_idx` ON `people_stats` (`year`,`month`);--> statement-breakpoint
CREATE TABLE `staff_demographics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`department` text NOT NULL,
	`gender` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `staff_demographics_year_idx` ON `staff_demographics` (`year`);--> statement-breakpoint
CREATE TABLE `student_demographics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`qualification` text NOT NULL,
	`gender` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `student_demographics_year_idx` ON `student_demographics` (`year`);--> statement-breakpoint
CREATE TABLE `sustainability_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`targetYear` integer NOT NULL,
	`targetValue` real,
	`unit` text,
	`isCompleted` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `waste` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`week` integer NOT NULL,
	`category` text NOT NULL,
	`valueTons` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `waste_time_idx` ON `waste` (`year`,`week`);--> statement-breakpoint
CREATE INDEX `waste_category_idx` ON `waste` (`category`);