CREATE TABLE `credit_alert_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`thresholdId` int NOT NULL,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`creditsUsed` decimal(10,4) NOT NULL,
	`thresholdValue` decimal(10,2) NOT NULL,
	`emailSent` int NOT NULL DEFAULT 0,
	`metadata` json,
	CONSTRAINT `credit_alert_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_alert_thresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`thresholdType` enum('daily','weekly','monthly','total') NOT NULL,
	`thresholdValue` decimal(10,2) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`notifyEmails` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_alert_thresholds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `credit_alert_history` ADD CONSTRAINT `credit_alert_history_thresholdId_credit_alert_thresholds_id_fk` FOREIGN KEY (`thresholdId`) REFERENCES `credit_alert_thresholds`(`id`) ON DELETE cascade ON UPDATE no action;