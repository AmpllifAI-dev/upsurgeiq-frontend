CREATE TABLE `credit_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`featureType` enum('press_release_generation','campaign_strategy_generation','ai_chat','image_generation','voice_transcription','content_analysis','other') NOT NULL,
	`creditsUsed` decimal(10,4) NOT NULL,
	`tokensUsed` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `credit_usage` ADD CONSTRAINT `credit_usage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;