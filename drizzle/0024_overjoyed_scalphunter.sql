ALTER TABLE `car_rentals` ADD `paymentStatus` enum('paid','pending') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `hotels` ADD `paymentStatus` enum('paid','pending') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `restaurants` ADD `paymentStatus` enum('paid','pending') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `transportation` ADD `paymentStatus` enum('paid','pending') DEFAULT 'pending';