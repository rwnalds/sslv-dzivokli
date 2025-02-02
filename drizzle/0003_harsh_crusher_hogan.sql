ALTER TABLE "reminder" ADD COLUMN "recurrence" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "reminder" ADD COLUMN "last_sent" timestamp;