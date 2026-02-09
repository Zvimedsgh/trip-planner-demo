CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`activityType` enum('hotel','transportation','car_rental','restaurant','tourist_site','other') NOT NULL,
	`activityId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`paymentDate` bigint NOT NULL,
	`paymentMethod` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
ALTER TABLE `checklist_items` MODIFY COLUMN `owner` enum('shared','ofir','ruth') NOT NULL DEFAULT 'shared';--> statement-breakpoint
ALTER TABLE `documents` MODIFY COLUMN `category` enum('passport','visa','insurance','booking','ticket','restaurant','hotel','flights','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `transportation` MODIFY COLUMN `type` enum('flight','train','bus','ferry','car_rental','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `car_rentals` ADD `linkedDocumentId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `coverImage` varchar(500);--> statement-breakpoint
ALTER TABLE `documents` ADD `hotelId` int;--> statement-breakpoint
ALTER TABLE `hotels` ADD `gallery` text;--> statement-breakpoint
ALTER TABLE `hotels` ADD `linkedDocumentId` int;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `coverImage` varchar(500);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `linkedDocumentId` int;--> statement-breakpoint
ALTER TABLE `tourist_sites` ADD `coverImage` varchar(500);--> statement-breakpoint
ALTER TABLE `tourist_sites` ADD `linkedDocumentId` int;--> statement-breakpoint
ALTER TABLE `transportation` ADD `company` varchar(255);--> statement-breakpoint
ALTER TABLE `transportation` ADD `carModel` varchar(255);--> statement-breakpoint
ALTER TABLE `transportation` ADD `pickupLocation` varchar(500);--> statement-breakpoint
ALTER TABLE `transportation` ADD `returnLocation` varchar(500);--> statement-breakpoint
ALTER TABLE `transportation` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `transportation` ADD `linkedDocumentId` int;