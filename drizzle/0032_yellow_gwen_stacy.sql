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
