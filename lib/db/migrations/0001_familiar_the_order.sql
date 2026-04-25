ALTER TABLE "coverage_run" ADD COLUMN "mutation_killed" integer;--> statement-breakpoint
ALTER TABLE "coverage_run" ADD COLUMN "mutation_total" integer;--> statement-breakpoint
ALTER TABLE "coverage_run" ADD COLUMN "mutation_score" double precision;--> statement-breakpoint
ALTER TABLE "coverage_service" ADD COLUMN "mutation_killed" integer;--> statement-breakpoint
ALTER TABLE "coverage_service" ADD COLUMN "mutation_total" integer;--> statement-breakpoint
ALTER TABLE "coverage_service" ADD COLUMN "mutation_score" double precision;