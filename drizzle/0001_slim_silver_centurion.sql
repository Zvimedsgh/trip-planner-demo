CREATE TABLE `car_rentals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`company` varchar(255) NOT NULL,
	`carModel` varchar(255),
	`pickupDate` bigint NOT NULL,
	`returnDate` bigint NOT NULL,
	`pickupLocation` varchar(500),
	`returnLocation` varchar(500),
	`confirmationNumber` varchar(100),
	`price` decimal(10,2),
	`currency` varchar(10) DEFAULT 'USD',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `car_rentals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('passport','visa','insurance','booking','ticket','other') NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`mimeType` varchar(100),
	`tags` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(500),
	`checkInDate` bigint NOT NULL,
	`checkOutDate` bigint NOT NULL,
	`confirmationNumber` varchar(100),
	`price` decimal(10,2),
	`currency` varchar(10) DEFAULT 'USD',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(500),
	`cuisineType` varchar(100),
	`reservationDate` bigint,
	`numberOfDiners` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tourist_sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(500),
	`description` text,
	`openingHours` varchar(255),
	`plannedVisitDate` bigint,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tourist_sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transportation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`type` enum('flight','train','bus','ferry','other') NOT NULL,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`departureDate` bigint NOT NULL,
	`arrivalDate` bigint,
	`confirmationNumber` varchar(100),
	`price` decimal(10,2),
	`currency` varchar(10) DEFAULT 'USD',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transportation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`startDate` bigint NOT NULL,
	`endDate` bigint NOT NULL,
	`description` text,
	`coverImage` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','he') DEFAULT 'en' NOT NULL;