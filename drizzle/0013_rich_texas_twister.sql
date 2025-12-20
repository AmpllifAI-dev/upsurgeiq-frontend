CREATE TABLE `campaign_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`date` timestamp NOT NULL,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`engagements` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`spend` int DEFAULT 0,
	`reach` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`milestoneId` int,
	`title` varchar(255) NOT NULL,
	`type` enum('press_release','social_post','email','blog_post','video','infographic','other') NOT NULL,
	`status` enum('draft','in_review','approved','published') NOT NULL DEFAULT 'draft',
	`contentId` int,
	`dueDate` timestamp,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`status` enum('pending','in_progress','completed','blocked') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `status` enum('draft','planning','active','paused','completed','archived') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `budget` decimal(10,2);--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `startDate` date;--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `endDate` date;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `targetAudience` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `aiGeneratedStrategy` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `keyMessages` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `successMetrics` text;--> statement-breakpoint
ALTER TABLE `campaign_analytics` ADD CONSTRAINT `campaign_analytics_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_deliverables` ADD CONSTRAINT `campaign_deliverables_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_deliverables` ADD CONSTRAINT `campaign_deliverables_milestoneId_campaign_milestones_id_fk` FOREIGN KEY (`milestoneId`) REFERENCES `campaign_milestones`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_milestones` ADD CONSTRAINT `campaign_milestones_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;