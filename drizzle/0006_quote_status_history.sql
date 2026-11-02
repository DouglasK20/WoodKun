CREATE TABLE `quote_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`status` enum('draft','sent','approved','rejected') NOT NULL,
	`changed_at` timestamp NOT NULL DEFAULT (now()),
	`changed_by` varchar(36),
	`changed_by_name` varchar(255),
	CONSTRAINT `quote_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quote_status_history` ADD CONSTRAINT `quote_status_history_quote_id_quotes_id_fk` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quote_status_history` ADD CONSTRAINT `quote_status_history_changed_by_users_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `quote_status_history_quote_id_idx` ON `quote_status_history` (`quote_id`);--> statement-breakpoint
-- Migração de dados: orçamentos que já existiam ganham o primeiro registro (status atual, na data de criação)
INSERT INTO `quote_status_history` (`quote_id`, `status`, `changed_at`) SELECT `id`, `status`, `created_at` FROM `quotes`;
