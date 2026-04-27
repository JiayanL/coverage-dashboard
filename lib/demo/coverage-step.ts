import type { IngestPayload } from "@/lib/coverage/schema"

// Staged Act 2 / Act 3 coverage payloads. Each step is a complete ingest
// payload; calling `/api/demo/coverage-step?step=N` writes a new
// `coverage_run` so the trend chart visibly moves on stage.
//
// Step shape:
//   step=0  Baseline before triage. Roughly matches the coverage figures
//           in consumer-banking-platform/COMPLIANCE.md §2.
//   step=1  Approved sessions kicked off — first 3 PRs (#18 #19 #20)
//           merged. Coverage + mutation tick up together.
//   step=2  Stuck audit-logger session unblocked, more PRs merged.
//   step=3  Overnight digest landed — Act 3 payoff. Coverage and mutation
//           are now both at the upper end of the per-service tolerance.
//
// Each step is also offset in time so the trend chart shows movement
// across days, not just the latest point. baseDate is the "today" of the
// demo (deterministic — driven by the step index, not wall clock — so the
// chart looks identical every rehearsal).
//
// All numbers are intentionally believable: per-service deltas roughly
// match the CBP COMPLIANCE.md §2 tolerance bands and the
// `lib/demo/data.ts` fleet recommendations.

const REPO = "JiayanL/consumer-banking-platform"

type ServiceSpec = {
  lang: "java" | "typescript" | "python"
  description: string
  // base coverage at step=0 (line/instruction-level)
  baseCovered: number
  baseTotal: number
  // base mutation at step=0
  baseMutationKilled: number
  baseMutationTotal: number
  // additional covered instructions per step (cumulative across steps)
  stepCoveredAdds: [number, number, number, number]
  // additional mutants killed per step (cumulative)
  stepMutationAdds: [number, number, number, number]
}

const SERVICES: Record<string, ServiceSpec> = {
  "account-service": {
    lang: "java",
    description:
      "Spring Boot account CRUD, balance inquiry, and freeze/unfreeze lifecycle over H2.",
    baseCovered: 340,
    baseTotal: 1000,
    baseMutationKilled: 31,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 18, 32, 47],
    stepMutationAdds: [0, 2, 4, 7],
  },
  "auth-service": {
    lang: "java",
    description:
      "Spring Boot HS256 JWT login, refresh, introspection, and admin registration service.",
    baseCovered: 396,
    baseTotal: 1000,
    baseMutationKilled: 36,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 0, 0, 0], // owner-locked; rejected in triage
    stepMutationAdds: [0, 0, 0, 0],
  },
  "ledger-service": {
    lang: "java",
    description:
      "Double-entry journal submission, posting queries, and derived balance enforcement.",
    baseCovered: 335,
    baseTotal: 1000,
    baseMutationKilled: 32,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 24, 24, 38], // PR #19 merged at step 1
    stepMutationAdds: [0, 3, 3, 6],
  },
  "wire-transfer-service": {
    lang: "java",
    description:
      "Spring Boot 2.7 wire initiation, lookup, cancellation, and H2-backed payment workflow.",
    baseCovered: 317,
    baseTotal: 1000,
    baseMutationKilled: 28,
    baseMutationTotal: 90,
    // Sanctions screener (PR #18) merges at step 1; BatchSettlementJob
    // is rejected (Wires mid-migration), so deltas are smaller than ledger.
    stepCoveredAdds: [0, 36, 36, 51],
    stepMutationAdds: [0, 4, 4, 7],
  },
  "transaction-processor": {
    lang: "java",
    description:
      "Primary money-movement path for idempotency, limits, fraud hooks, ledger posting, and reversals.",
    baseCovered: 180,
    baseTotal: 1000,
    baseMutationKilled: 14,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 0, 0, 0], // rejected — integration harness
    stepMutationAdds: [0, 0, 0, 0],
  },
  "audit-logger": {
    lang: "java",
    description:
      "Append-only audit event write path with downstream immutable archive forwarding.",
    baseCovered: 305,
    baseTotal: 1000,
    baseMutationKilled: 27,
    baseMutationTotal: 80,
    // Step 1 the session is blocked (no delta). Step 2 unblocked.
    stepCoveredAdds: [0, 0, 22, 31],
    stepMutationAdds: [0, 0, 3, 5],
  },
  "api-gateway": {
    lang: "typescript",
    description:
      "Public Express gateway for auth header checks, request IDs, and stubbed downstream routing.",
    baseCovered: 352,
    baseTotal: 1000,
    baseMutationKilled: 33,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 0, 0, 12], // overnight ring2 picks it up
    stepMutationAdds: [0, 0, 0, 2],
  },
  "customer-profile-api": {
    lang: "typescript",
    description:
      "Customer profile CRUD and communication preferences using in-memory storage.",
    baseCovered: 318,
    baseTotal: 1000,
    baseMutationKilled: 29,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 12, 18, 28],
    stepMutationAdds: [0, 2, 3, 5],
  },
  "notification-service": {
    lang: "typescript",
    description:
      "Sandbox email/SMS notification templates and in-memory delivery records.",
    baseCovered: 287,
    baseTotal: 1000,
    baseMutationKilled: 24,
    baseMutationTotal: 80,
    stepCoveredAdds: [0, 0, 0, 9],
    stepMutationAdds: [0, 0, 0, 1],
  },
  "session-manager": {
    lang: "typescript",
    description:
      "Session lifecycle and JWT issuance with idle reaping semantics.",
    baseCovered: 326,
    baseTotal: 1000,
    baseMutationKilled: 30,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 0, 0, 0], // ties to PLAT-1912 / PLAT-1871-b
    stepMutationAdds: [0, 0, 0, 0],
  },
  "kyc-enrichment": {
    lang: "python",
    description:
      "FastAPI KYC enrichment with sanctions/PEP stubs, risk tiers, and PII utilities.",
    baseCovered: 365,
    baseTotal: 1000,
    baseMutationKilled: 35,
    baseMutationTotal: 90,
    stepCoveredAdds: [0, 0, 18, 26],
    stepMutationAdds: [0, 0, 2, 4],
  },
  "reporting-aggregator": {
    lang: "python",
    description:
      "Flask daily/monthly transaction aggregation, flagged transaction reporting, and account totals.",
    baseCovered: 366,
    baseTotal: 1000,
    baseMutationKilled: 25,
    baseMutationTotal: 60,
    stepCoveredAdds: [0, 0, 8, 14],
    stepMutationAdds: [0, 0, 1, 2],
  },
}

const FILE_HOTSPOTS: Array<{
  service: keyof typeof SERVICES
  path: string
  lang: "java" | "typescript" | "python"
  baseCovered: number
  baseTotal: number
  stepCoveredAdds: [number, number, number, number]
}> = [
  {
    service: "transaction-processor",
    path: "services/transaction-processor/src/main/java/com/cbp/txn/TransactionProcessor.java",
    lang: "java",
    baseCovered: 36,
    baseTotal: 220,
    stepCoveredAdds: [0, 0, 0, 0],
  },
  {
    service: "wire-transfer-service",
    path: "services/wire-transfer-service/src/main/java/com/cbp/wire/SanctionsScreener.java",
    lang: "java",
    baseCovered: 87,
    baseTotal: 280,
    stepCoveredAdds: [0, 36, 36, 48],
  },
  {
    service: "ledger-service",
    path: "services/ledger-service/src/main/java/com/cbp/ledger/DoubleEntryValidator.java",
    lang: "java",
    baseCovered: 124,
    baseTotal: 240,
    stepCoveredAdds: [0, 24, 24, 30],
  },
  {
    service: "kyc-enrichment",
    path: "services/kyc-enrichment/src/kyc_enrichment/risk_scoring.py",
    lang: "python",
    baseCovered: 94,
    baseTotal: 260,
    stepCoveredAdds: [0, 0, 18, 24],
  },
  {
    service: "customer-profile-api",
    path: "services/customer-profile-api/src/piiMasking.ts",
    lang: "typescript",
    baseCovered: 102,
    baseTotal: 290,
    stepCoveredAdds: [0, 12, 18, 24],
  },
  {
    service: "audit-logger",
    path: "services/audit-logger/src/main/java/com/cbp/audit/ForwardingSink.java",
    lang: "java",
    baseCovered: 58,
    baseTotal: 180,
    stepCoveredAdds: [0, 0, 22, 31],
  },
]

const TEST_BASE: Record<
  string,
  { lang: "java" | "typescript" | "python"; run: number; failed: number }
> = {
  "account-service": { lang: "java", run: 42, failed: 0 },
  "auth-service": { lang: "java", run: 38, failed: 0 },
  "ledger-service": { lang: "java", run: 31, failed: 1 },
  "wire-transfer-service": { lang: "java", run: 34, failed: 1 },
  "transaction-processor": { lang: "java", run: 19, failed: 1 },
  "audit-logger": { lang: "java", run: 23, failed: 0 },
  "api-gateway": { lang: "typescript", run: 28, failed: 0 },
  "customer-profile-api": { lang: "typescript", run: 17, failed: 0 },
  "notification-service": { lang: "typescript", run: 14, failed: 0 },
  "session-manager": { lang: "typescript", run: 21, failed: 1 },
  "kyc-enrichment": { lang: "python", run: 26, failed: 0 },
  "reporting-aggregator": { lang: "python", run: 22, failed: 0 },
}

// Test counts grow with coverage adds. Approximation: one new test per ~6
// instructions covered.
function testsForStep(serviceName: string, step: number): number {
  const svc = SERVICES[serviceName]
  const base = TEST_BASE[serviceName]?.run ?? 0
  const cumAdded = svc.stepCoveredAdds[step] ?? 0
  return base + Math.round(cumAdded / 6)
}

function shaForStep(step: number): string {
  // Deterministic, looks-real shas. The step index is encoded so re-running
  // the demo overwrites the same per-step run rather than piling up.
  const stems = [
    "0baseline2026apr27a1",
    "1triage2026apr27b2cc",
    "2unblock2026apr27c3dd",
    "3overnight2026apr27d4",
  ]
  return stems[step] ?? `step${step}`
}

// All steps use the same anchor "today" so the trend chart layout is
// stable across reruns. Step N is N "days" after baseline.
const DEMO_ANCHOR = new Date("2026-04-27T16:00:00.000Z")

function timestampForStep(step: number): string {
  const d = new Date(DEMO_ANCHOR)
  d.setUTCDate(d.getUTCDate() + step)
  return d.toISOString()
}

export const DEMO_STEP_COUNT = 4
export const DEMO_REPO = REPO

export function buildDemoStepPayload(step: number): IngestPayload {
  if (step < 0 || step >= DEMO_STEP_COUNT) {
    throw new Error(`step must be in [0, ${DEMO_STEP_COUNT - 1}]`)
  }

  let totalCovered = 0
  let totalUnits = 0
  let totalMutKilled = 0
  let totalMutTotal = 0

  const services: IngestPayload["services"] = {}
  const testSummary: NonNullable<IngestPayload["test_summary"]>["services"] = {}

  for (const [name, spec] of Object.entries(SERVICES)) {
    const covered = spec.baseCovered + spec.stepCoveredAdds[step]
    const total = spec.baseTotal
    const pct = covered / total
    const killed = spec.baseMutationKilled + spec.stepMutationAdds[step]
    const mutTotal = spec.baseMutationTotal
    const mutScore = killed / mutTotal

    services[name] = {
      lang: spec.lang,
      description: spec.description,
      covered,
      total,
      pct,
      mutation: { killed, total: mutTotal, score: mutScore },
    }

    const base = TEST_BASE[name]
    if (base) {
      const run = testsForStep(name, step)
      const failed = base.failed
      const passed = run - failed
      testSummary[name] = {
        lang: base.lang,
        run,
        passed,
        failed,
        errors: 0,
        skipped: 0,
      }
    }

    totalCovered += covered
    totalUnits += total
    totalMutKilled += killed
    totalMutTotal += mutTotal
  }

  const files = FILE_HOTSPOTS.map((h) => {
    const covered = h.baseCovered + h.stepCoveredAdds[step]
    return {
      service: h.service,
      path: h.path,
      lang: h.lang,
      covered,
      total: h.baseTotal,
      pct: covered / h.baseTotal,
    }
  })

  return {
    repo: REPO,
    display_name: "consumer-banking-platform",
    kind: "monorepo",
    sha: shaForStep(step),
    ref: "refs/heads/main",
    run_id: `demo-step-${step}`,
    timestamp: timestampForStep(step),
    overall: {
      covered: totalCovered,
      total: totalUnits,
      pct: totalCovered / totalUnits,
      mutation: {
        killed: totalMutKilled,
        total: totalMutTotal,
        score: totalMutKilled / totalMutTotal,
      },
    },
    services,
    files,
    test_summary: { services: testSummary },
  }
}

// Build all 4 step payloads — used by the demo seed script that replays
// the entire trend so the chart is populated from a clean DB.
export function buildAllDemoStepPayloads(): IngestPayload[] {
  return Array.from({ length: DEMO_STEP_COUNT }, (_, i) =>
    buildDemoStepPayload(i),
  )
}
