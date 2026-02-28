CREATE TABLE `must_visit_pois` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(500),
	`category` varchar(100) NOT NULL,
	`categoryIcon` varchar(10),
	`categoryColor` varchar(20),
	`placeId` varchar(255),
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`rating` decimal(2,1),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `must_visit_pois_id` PRIMARY KEY(`id`)
);
