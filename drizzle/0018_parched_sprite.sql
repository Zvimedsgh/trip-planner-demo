CREATE TABLE `trip_collaborators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`permission` enum('view_only','can_edit') NOT NULL DEFAULT 'view_only',
	`invitedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trip_collaborators_id` PRIMARY KEY(`id`)
);
