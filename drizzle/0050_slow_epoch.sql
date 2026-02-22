ALTER TABLE `hotels` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `trip_routes` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `tourist_sites` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `transportation` ADD `departureTime` varchar(10);--> statement-breakpoint
ALTER TABLE `transportation` ADD `departureLocation` varchar(255);--> statement-breakpoint
ALTER TABLE `transportation` ADD `arrivalTime` varchar(10);--> statement-breakpoint
ALTER TABLE `transportation` ADD `arrivalLocation` varchar(255);