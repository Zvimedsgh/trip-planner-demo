ALTER TABLE `transportation` MODIFY COLUMN `type` enum('flight','train','bus','ferry','car_rental','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `transportation` ADD `company` varchar(255);--> statement-breakpoint
ALTER TABLE `transportation` ADD `carModel` varchar(255);--> statement-breakpoint
ALTER TABLE `transportation` ADD `pickupLocation` varchar(500);--> statement-breakpoint
ALTER TABLE `transportation` ADD `returnLocation` varchar(500);--> statement-breakpoint
ALTER TABLE `transportation` ADD `phone` varchar(50);