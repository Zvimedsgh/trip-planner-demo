ALTER TABLE `restaurants` ADD `price` decimal(10,2);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `currency` varchar(10) DEFAULT 'USD';