CREATE TABLE `scheduled_press_releases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessId` int,
	`pressReleaseId` int,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`timezone` varchar(100) DEFAULT 'UTC',
	`status` enum('pending','sent','failed','canceled') DEFAULT 'pending',
	`distributionLists` json,
	`socialMediaPosts` json,
	`sentAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_press_releases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `website_research` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessId` int,
	`url` varchar(500) NOT NULL,
	`companyName` varchar(255),
	`industry` varchar(255),
	`description` text,
	`products` json,
	`recentNews` json,
	`keyPeople` json,
	`contactInfo` json,
	`socialMedia` json,
	`competitors` json,
	`keyMessages` json,
	`brandTone` varchar(255),
	`targetAudience` text,
	`rawContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `website_research_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `scheduled_press_releases` ADD CONSTRAINT `scheduled_press_releases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduled_press_releases` ADD CONSTRAINT `scheduled_press_releases_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduled_press_releases` ADD CONSTRAINT `scheduled_press_releases_pressReleaseId_press_releases_id_fk` FOREIGN KEY (`pressReleaseId`) REFERENCES `press_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `website_research` ADD CONSTRAINT `website_research_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `website_research` ADD CONSTRAINT `website_research_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;