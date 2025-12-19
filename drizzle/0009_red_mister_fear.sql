CREATE TABLE `approval_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`approvalRequestId` int NOT NULL,
	`userId` int NOT NULL,
	`comment` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pressReleaseId` int NOT NULL,
	`requesterId` int NOT NULL,
	`approverId` int,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`requestMessage` text,
	`responseMessage` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pressReleaseId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`subtitle` varchar(500),
	`content` text NOT NULL,
	`userId` int NOT NULL,
	`changeDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `approval_comments` ADD CONSTRAINT `approval_comments_approvalRequestId_approval_requests_id_fk` FOREIGN KEY (`approvalRequestId`) REFERENCES `approval_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_comments` ADD CONSTRAINT `approval_comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_pressReleaseId_press_releases_id_fk` FOREIGN KEY (`pressReleaseId`) REFERENCES `press_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_requesterId_users_id_fk` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_approverId_users_id_fk` FOREIGN KEY (`approverId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_versions` ADD CONSTRAINT `content_versions_pressReleaseId_press_releases_id_fk` FOREIGN KEY (`pressReleaseId`) REFERENCES `press_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_versions` ADD CONSTRAINT `content_versions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;