ALTER TABLE `checklist_items` ADD `isPrivate` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `checklist_items` ADD `userId` int;