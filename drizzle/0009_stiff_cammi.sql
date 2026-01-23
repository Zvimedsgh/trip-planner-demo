CREATE TABLE `day_trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`startLocation` varchar(255) NOT NULL,
	`endLocation` varchar(255) NOT NULL,
	`startTime` bigint NOT NULL,
	`endTime` bigint NOT NULL,
	`stops` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `day_trips_id` PRIMARY KEY(`id`)
);
