CREATE TABLE `distribution_saves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`press_release_id` int NOT NULL,
	`media_list_ids` text NOT NULL,
	`scheduled_for` timestamp,
	`reminder_sent` boolean NOT NULL DEFAULT false,
	`completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `distribution_saves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journalist_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`media_list_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`publication` varchar(255) NOT NULL,
	`beat` varchar(255),
	`region` varchar(255),
	`industry` varchar(255),
	`phone` varchar(50),
	`twitter` varchar(255),
	`linkedin` varchar(255),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalist_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_list_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('genre','geography','industry') NOT NULL,
	`description` text,
	`is_populated` boolean NOT NULL DEFAULT false,
	`generated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_list_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_list_credit_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('purchase','deduction','refund') NOT NULL,
	`description` varchar(255),
	`stripe_session_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_list_credit_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_list_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`credits` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_list_credits_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_list_credits_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `media_list_generation_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`category_id` int NOT NULL,
	`category_name` varchar(255) NOT NULL,
	`category_type` enum('genre','geography','industry') NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`contacts_generated` int DEFAULT 0,
	`error_message` text,
	`requested_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `media_list_generation_requests_id` PRIMARY KEY(`id`)
);
