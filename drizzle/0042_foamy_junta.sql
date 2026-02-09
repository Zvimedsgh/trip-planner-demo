DROP TABLE `payments`;--> statement-breakpoint
DROP TABLE `route_points_of_interest`;--> statement-breakpoint
ALTER TABLE `checklist_items` MODIFY COLUMN `owner` enum('shared','yona_tzvi','efi','ruth','michal') NOT NULL DEFAULT 'shared';--> statement-breakpoint
ALTER TABLE `documents` MODIFY COLUMN `category` enum('passport','visa','insurance','booking','ticket','restaurant','hotel','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `transportation` MODIFY COLUMN `type` enum('flight','train','bus','ferry','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `car_rentals` DROP COLUMN `linkedDocumentId`;--> statement-breakpoint
ALTER TABLE `documents` DROP COLUMN `coverImage`;--> statement-breakpoint
ALTER TABLE `documents` DROP COLUMN `hotelId`;--> statement-breakpoint
ALTER TABLE `hotels` DROP COLUMN `gallery`;--> statement-breakpoint
ALTER TABLE `hotels` DROP COLUMN `linkedDocumentId`;--> statement-breakpoint
ALTER TABLE `restaurants` DROP COLUMN `coverImage`;--> statement-breakpoint
ALTER TABLE `restaurants` DROP COLUMN `linkedDocumentId`;--> statement-breakpoint
ALTER TABLE `tourist_sites` DROP COLUMN `coverImage`;--> statement-breakpoint
ALTER TABLE `tourist_sites` DROP COLUMN `linkedDocumentId`;--> statement-breakpoint
ALTER TABLE `transportation` DROP COLUMN `company`;--> statement-breakpoint
ALTER TABLE `transportation` DROP COLUMN `carModel`;--> statement-breakpoint
ALTER TABLE `transportation` DROP COLUMN `pickupLocation`;--> statement-breakpoint
ALTER TABLE `transportation` DROP COLUMN `returnLocation`;--> statement-breakpoint
ALTER TABLE `transportation` DROP COLUMN `phone`;--> statement-breakpoint
ALTER TABLE `transportation` DROP COLUMN `linkedDocumentId`;