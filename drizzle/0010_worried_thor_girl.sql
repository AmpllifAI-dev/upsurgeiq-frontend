CREATE TABLE `webhook_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`eventType` enum('user.registered','user.onboarded') NOT NULL,
	`webhookUrl` varchar(1000) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`retryAttempts` int NOT NULL DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_delivery_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookConfigId` int NOT NULL,
	`eventType` varchar(50) NOT NULL,
	`payload` text NOT NULL,
	`success` int NOT NULL,
	`statusCode` int,
	`errorMessage` text,
	`attempts` int NOT NULL DEFAULT 1,
	`deliveredAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_delivery_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `webhook_delivery_logs` ADD CONSTRAINT `webhook_delivery_logs_webhookConfigId_webhook_configs_id_fk` FOREIGN KEY (`webhookConfigId`) REFERENCES `webhook_configs`(`id`) ON DELETE cascade ON UPDATE no action;