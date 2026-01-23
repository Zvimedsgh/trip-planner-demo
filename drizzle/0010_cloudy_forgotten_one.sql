CREATE TABLE `trip_collaborators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`permission` enum('view','edit') NOT NULL DEFAULT 'edit',
	`invitedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_collaborators_id` PRIMARY KEY(`id`)
);
