CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`entityType` enum('hotel','transportation','car_rental','tourist_site','restaurant','document','checklist','day_trip') NOT NULL,
	`entityId` int,
	`entityName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trip_collaborators` ADD `lastSeen` timestamp;--> statement-breakpoint
ALTER TABLE `trip_collaborators` ADD `visitCount` int DEFAULT 0 NOT NULL;