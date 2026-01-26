CREATE TABLE `route_points_of_interest` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routeId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameHe` varchar(255),
	`type` enum('attraction','restaurant','gas_station','other') NOT NULL,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`address` text,
	`placeId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `route_points_of_interest_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `checklist_items` ADD `owner` enum('shared','yona_tzvi','efi','ruth','michal') DEFAULT 'shared' NOT NULL;--> statement-breakpoint
ALTER TABLE `checklist_items` DROP COLUMN `isPrivate`;--> statement-breakpoint
ALTER TABLE `checklist_items` DROP COLUMN `userId`;