CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` int NOT NULL DEFAULT 1,
	`pressReleaseNotifications` int NOT NULL DEFAULT 1,
	`campaignNotifications` int NOT NULL DEFAULT 1,
	`socialMediaNotifications` int NOT NULL DEFAULT 1,
	`weeklyDigest` int NOT NULL DEFAULT 1,
	`marketingEmails` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;