CREATE TABLE `air_quality` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text NOT NULL,
	`temperature` real NOT NULL,
	`co2` integer NOT NULL,
	`moisture` real NOT NULL,
	`voc` integer NOT NULL,
	`pm25` real NOT NULL,
	`pm10` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `air_quality_timestamp_idx` ON `air_quality` (`timestamp`);--> statement-breakpoint
CREATE TABLE `goal_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`goalTitle` text NOT NULL,
	`username` text NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sensor_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text NOT NULL,
	`location` text NOT NULL,
	`temperature` real NOT NULL,
	`humidity` real NOT NULL,
	`co2` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sensor_data_timestamp_idx` ON `sensor_data` (`timestamp`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sensor_data_location_idx` ON `sensor_data` (`location`);--> statement-breakpoint
CREATE TABLE `student_department` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`department` text NOT NULL,
	`gender` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `student_department_year_idx` ON `student_department` (`year`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`passwordHash` text,
	`role` text DEFAULT 'mitarbeiterin' NOT NULL,
	`isActive` integer DEFAULT 0 NOT NULL,
	`inviteToken` text,
	`resetToken` text,
	`tokenExpiresAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
DROP INDEX `people_stats_time_idx`;--> statement-breakpoint
CREATE INDEX `people_stats_time_idx` ON `people_stats` (`year`);--> statement-breakpoint
ALTER TABLE `people_stats` DROP COLUMN `month`;