ALTER TABLE `users` ADD `isDemoUser` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `demoStartDate` bigint;--> statement-breakpoint
ALTER TABLE `users` ADD `demoExpiryDate` bigint;--> statement-breakpoint
ALTER TABLE `users` ADD `maxTrips` int;