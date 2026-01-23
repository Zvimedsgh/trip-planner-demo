CREATE TABLE `checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('documents','bookings','packing','health','finance','other') NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`dueDate` bigint,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_items_id` PRIMARY KEY(`id`)
);
