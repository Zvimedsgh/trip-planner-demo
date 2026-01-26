ALTER TABLE `trip_routes` ADD `distanceKm` decimal(8,2);--> statement-breakpoint
ALTER TABLE `trip_routes` ADD `estimatedDuration` int;--> statement-breakpoint
ALTER TABLE `trip_routes` ADD `roadType` varchar(50);