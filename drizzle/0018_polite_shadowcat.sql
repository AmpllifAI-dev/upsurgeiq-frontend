CREATE TABLE `image_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`creditsRemaining` int NOT NULL DEFAULT 0,
	`purchaseDate` timestamp NOT NULL DEFAULT (now()),
	`expiryDate` timestamp,
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `image_credits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `word_count_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wordsRemaining` int NOT NULL DEFAULT 0,
	`purchaseDate` timestamp NOT NULL DEFAULT (now()),
	`expiryDate` timestamp,
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `word_count_credits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `image_credits` ADD CONSTRAINT `image_credits_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `word_count_credits` ADD CONSTRAINT `word_count_credits_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;