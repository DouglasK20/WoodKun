CREATE TABLE `company_settings` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`document` varchar(18),
	`phone` varchar(20),
	`email` varchar(255),
	`zip_code` varchar(9),
	`street` varchar(255),
	`number` varchar(20),
	`complement` varchar(100),
	`neighborhood` varchar(100),
	`city` varchar(100),
	`state` varchar(2),
	`logo_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_settings_id` PRIMARY KEY(`id`)
);
