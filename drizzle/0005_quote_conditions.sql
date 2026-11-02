ALTER TABLE `company_settings` ADD `default_validity_days` int;--> statement-breakpoint
ALTER TABLE `company_settings` ADD `payment_terms` text;--> statement-breakpoint
ALTER TABLE `company_settings` ADD `delivery_terms` text;--> statement-breakpoint
ALTER TABLE `quotes` ADD `payment_terms` text;--> statement-breakpoint
ALTER TABLE `quotes` ADD `delivery_terms` text;