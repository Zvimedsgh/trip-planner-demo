ALTER TABLE `trips` ADD `shareToken` varchar(32);--> statement-breakpoint
ALTER TABLE `trips` ADD CONSTRAINT `trips_shareToken_unique` UNIQUE(`shareToken`);