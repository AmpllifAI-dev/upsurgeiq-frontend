CREATE TABLE `error_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` enum('info','warn','error','debug') NOT NULL,
	`message` text NOT NULL,
	`userId` int,
	`component` varchar(100),
	`action` varchar(100),
	`errorStack` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `error_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `error_logs` ADD CONSTRAINT `error_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;