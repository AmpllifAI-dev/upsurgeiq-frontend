CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500),
	`headerHtml` text,
	`footerHtml` text,
	`primaryColor` varchar(7) DEFAULT '#008080',
	`secondaryColor` varchar(7) DEFAULT '#7FFF00',
	`logoUrl` varchar(500),
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `email_templates` ADD CONSTRAINT `email_templates_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;