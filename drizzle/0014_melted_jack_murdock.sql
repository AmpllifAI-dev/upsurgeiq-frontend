CREATE TABLE `campaign_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`goal` text,
	`targetAudience` text,
	`platforms` varchar(255),
	`suggestedBudget` decimal(10,2),
	`suggestedDuration` int,
	`strategy` text,
	`keyMessages` text,
	`successMetrics` text,
	`milestones` text,
	`deliverables` text,
	`isPublic` int DEFAULT 0,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaign_templates` ADD CONSTRAINT `campaign_templates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;