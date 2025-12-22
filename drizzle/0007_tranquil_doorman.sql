CREATE TABLE `press_release_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`titleTemplate` varchar(500),
	`subtitleTemplate` varchar(500),
	`bodyTemplate` text,
	`isDefault` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `press_release_templates_id` PRIMARY KEY(`id`)
);
