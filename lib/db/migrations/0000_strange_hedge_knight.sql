CREATE TYPE "public"."repo_kind" AS ENUM('single', 'monorepo');--> statement-breakpoint
CREATE TABLE "coverage_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"service_name" text NOT NULL,
	"path" text NOT NULL,
	"lang" text NOT NULL,
	"covered" integer NOT NULL,
	"total" integer NOT NULL,
	"pct" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverage_run" (
	"id" serial PRIMARY KEY NOT NULL,
	"repository_id" integer NOT NULL,
	"sha" text NOT NULL,
	"ref" text NOT NULL,
	"run_id" text,
	"covered_instructions" integer NOT NULL,
	"total_instructions" integer NOT NULL,
	"pct" double precision NOT NULL,
	"run_at" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverage_service" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"name" text NOT NULL,
	"lang" text NOT NULL,
	"covered" integer NOT NULL,
	"total" integer NOT NULL,
	"pct" double precision NOT NULL,
	"tests_run" integer,
	"tests_passed" integer,
	"tests_failed" integer,
	"tests_errors" integer,
	"tests_skipped" integer
);
--> statement-breakpoint
CREATE TABLE "repository" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"display_name" text NOT NULL,
	"kind" "repo_kind" DEFAULT 'single' NOT NULL,
	"default_branch" text DEFAULT 'main' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repository_full_name_unique" UNIQUE("full_name")
);
--> statement-breakpoint
ALTER TABLE "coverage_file" ADD CONSTRAINT "coverage_file_run_id_coverage_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."coverage_run"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_run" ADD CONSTRAINT "coverage_run_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_service" ADD CONSTRAINT "coverage_service_run_id_coverage_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."coverage_run"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coverage_file_run_idx" ON "coverage_file" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "coverage_file_run_pct_idx" ON "coverage_file" USING btree ("run_id","pct");--> statement-breakpoint
CREATE UNIQUE INDEX "coverage_run_repo_sha_idx" ON "coverage_run" USING btree ("repository_id","sha");--> statement-breakpoint
CREATE INDEX "coverage_run_repo_run_at_idx" ON "coverage_run" USING btree ("repository_id","run_at");--> statement-breakpoint
CREATE UNIQUE INDEX "coverage_service_run_name_idx" ON "coverage_service" USING btree ("run_id","name");--> statement-breakpoint
CREATE INDEX "coverage_service_name_idx" ON "coverage_service" USING btree ("name");