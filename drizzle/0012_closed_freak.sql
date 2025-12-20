CREATE TABLE `journalist_beat_relations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`journalistId` int NOT NULL,
	`beatId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalist_beat_relations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journalist_beats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalist_beats_id` PRIMARY KEY(`id`),
	CONSTRAINT `journalist_beats_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `journalist_outreach` (
	`id` int AUTO_INCREMENT NOT NULL,
	`journalistId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('email','phone','social','meeting') NOT NULL,
	`subject` varchar(500),
	`message` text,
	`status` enum('sent','opened','replied','bounced','no_response') NOT NULL DEFAULT 'sent',
	`sentAt` timestamp NOT NULL,
	`openedAt` timestamp,
	`repliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalist_outreach_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journalist_tag_relations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`journalistId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalist_tag_relations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journalist_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(7) DEFAULT '#3b82f6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalist_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `journalist_tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `journalists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`title` varchar(255),
	`mediaOutletId` int,
	`twitter` varchar(100),
	`linkedin` varchar(255),
	`website` varchar(500),
	`bio` text,
	`notes` text,
	`status` enum('active','inactive','bounced') NOT NULL DEFAULT 'active',
	`lastContactedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journalists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_outlets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`website` varchar(500),
	`type` enum('newspaper','magazine','online','tv','radio','podcast','blog') NOT NULL,
	`reach` enum('local','regional','national','international'),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_outlets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `journalist_beat_relations` ADD CONSTRAINT `journalist_beat_relations_journalistId_journalists_id_fk` FOREIGN KEY (`journalistId`) REFERENCES `journalists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalist_beat_relations` ADD CONSTRAINT `journalist_beat_relations_beatId_journalist_beats_id_fk` FOREIGN KEY (`beatId`) REFERENCES `journalist_beats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalist_outreach` ADD CONSTRAINT `journalist_outreach_journalistId_journalists_id_fk` FOREIGN KEY (`journalistId`) REFERENCES `journalists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalist_outreach` ADD CONSTRAINT `journalist_outreach_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalist_tag_relations` ADD CONSTRAINT `journalist_tag_relations_journalistId_journalists_id_fk` FOREIGN KEY (`journalistId`) REFERENCES `journalists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalist_tag_relations` ADD CONSTRAINT `journalist_tag_relations_tagId_journalist_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `journalist_tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalists` ADD CONSTRAINT `journalists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalists` ADD CONSTRAINT `journalists_mediaOutletId_media_outlets_id_fk` FOREIGN KEY (`mediaOutletId`) REFERENCES `media_outlets`(`id`) ON DELETE set null ON UPDATE no action;