CREATE TABLE `routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameHe` varchar(255),
	`description` text,
	`descriptionHe` text,
	`date` bigint NOT NULL,
	`time` varchar(5),
	`mapData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
