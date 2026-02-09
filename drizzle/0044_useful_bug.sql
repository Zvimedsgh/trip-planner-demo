CREATE TABLE `trip_travelers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`identifier` varchar(50) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trip_travelers_id` PRIMARY KEY(`id`)
);
