import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  uniqueIndex,
  index,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core"

export const repoKind = pgEnum("repo_kind", ["single", "monorepo"])

export const repository = pgTable("repository", {
  id: serial("id").primaryKey(),
  // e.g. "JiayanL/consumer-banking-platform"
  fullName: text("full_name").notNull().unique(),
  displayName: text("display_name").notNull(),
  kind: repoKind("kind").notNull().default("single"),
  defaultBranch: text("default_branch").notNull().default("main"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const coverageRun = pgTable(
  "coverage_run",
  {
    id: serial("id").primaryKey(),
    repositoryId: integer("repository_id")
      .notNull()
      .references(() => repository.id, { onDelete: "cascade" }),
    sha: text("sha").notNull(),
    ref: text("ref").notNull(),
    runId: text("run_id"),
    coveredInstructions: integer("covered_instructions").notNull(),
    totalInstructions: integer("total_instructions").notNull(),
    pct: doublePrecision("pct").notNull(),
    mutationKilled: integer("mutation_killed"),
    mutationTotal: integer("mutation_total"),
    mutationScore: doublePrecision("mutation_score"),
    runAt: timestamp("run_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("coverage_run_repo_sha_idx").on(t.repositoryId, t.sha),
    index("coverage_run_repo_run_at_idx").on(t.repositoryId, t.runAt),
  ],
)

export const coverageService = pgTable(
  "coverage_service",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => coverageRun.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    lang: text("lang").notNull(),
    covered: integer("covered").notNull(),
    total: integer("total").notNull(),
    pct: doublePrecision("pct").notNull(),
    mutationKilled: integer("mutation_killed"),
    mutationTotal: integer("mutation_total"),
    mutationScore: doublePrecision("mutation_score"),
    testsRun: integer("tests_run"),
    testsPassed: integer("tests_passed"),
    testsFailed: integer("tests_failed"),
    testsErrors: integer("tests_errors"),
    testsSkipped: integer("tests_skipped"),
    description: text("description"),
  },
  (t) => [
    uniqueIndex("coverage_service_run_name_idx").on(t.runId, t.name),
    index("coverage_service_name_idx").on(t.name),
  ],
)

export const coverageFile = pgTable(
  "coverage_file",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => coverageRun.id, { onDelete: "cascade" }),
    serviceName: text("service_name").notNull(),
    path: text("path").notNull(),
    lang: text("lang").notNull(),
    covered: integer("covered").notNull(),
    total: integer("total").notNull(),
    pct: doublePrecision("pct").notNull(),
  },
  (t) => [
    index("coverage_file_run_idx").on(t.runId),
    index("coverage_file_run_pct_idx").on(t.runId, t.pct),
  ],
)

export type Repository = typeof repository.$inferSelect
export type CoverageRun = typeof coverageRun.$inferSelect
export type CoverageService = typeof coverageService.$inferSelect
export type CoverageFile = typeof coverageFile.$inferSelect
