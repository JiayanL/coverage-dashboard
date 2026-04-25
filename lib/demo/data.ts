export type DemoRecommendation = {
  rank: number
  service: string
  path: string
  owner: string
  coverage: number
  mutationScore: number
  impact: number
  status: "approved" | "rejected"
  reason: string
  sessionId: string
  sessionStatus: "queued" | "running" | "blocked" | "pr-opened" | "merged"
  pr?: string
  deltaCoverage: number
  deltaMutation: number
}

export type PolicyRing = {
  ring: string
  autonomy: string
  scope: string
  approval: string
}

export const demoRecommendations: DemoRecommendation[] = [
  {
    rank: 1,
    service: "wire-transfer-service",
    path: "services/wire-transfer-service/src/main/java/com/cbp/wire/SanctionsScreener.java",
    owner: "Payments Platform",
    coverage: 0.41,
    mutationScore: 0.34,
    impact: 9.8,
    status: "approved",
    reason: "OCC payment-screening path, high risk, stable owner surface.",
    sessionId: "devin-8f2a91",
    sessionStatus: "pr-opened",
    pr: "#18",
    deltaCoverage: 0.036,
    deltaMutation: 0.041,
  },
  {
    rank: 2,
    service: "ledger-service",
    path: "services/ledger-service/src/main/java/com/cbp/ledger/DoubleEntryValidator.java",
    owner: "Core Ledger",
    coverage: 0.52,
    mutationScore: 0.46,
    impact: 9.2,
    status: "approved",
    reason: "Invariant-heavy code with clear unit-test seam.",
    sessionId: "devin-1c77d4",
    sessionStatus: "merged",
    pr: "#19",
    deltaCoverage: 0.021,
    deltaMutation: 0.031,
  },
  {
    rank: 3,
    service: "kyc-enrichment",
    path: "services/kyc-enrichment/src/kyc_enrichment/risk_scoring.py",
    owner: "Financial Crimes",
    coverage: 0.48,
    mutationScore: 0.39,
    impact: 8.9,
    status: "approved",
    reason: "Pure scoring function; strong oracle from existing fixtures.",
    sessionId: "devin-a6402b",
    sessionStatus: "running",
    deltaCoverage: 0.018,
    deltaMutation: 0.023,
  },
  {
    rank: 4,
    service: "account-service",
    path: "services/account-service/src/main/java/com/cbp/account/AccountLifecycleService.java",
    owner: "Deposits",
    coverage: 0.57,
    mutationScore: 0.49,
    impact: 8.4,
    status: "approved",
    reason: "Regression surface for account holds and closures.",
    sessionId: "devin-c338a0",
    sessionStatus: "pr-opened",
    pr: "#20",
    deltaCoverage: 0.014,
    deltaMutation: 0.017,
  },
  {
    rank: 5,
    service: "customer-profile-api",
    path: "services/customer-profile-api/src/piiMasking.ts",
    owner: "Customer 360",
    coverage: 0.44,
    mutationScore: 0.31,
    impact: 8.1,
    status: "approved",
    reason: "PII masking is business-critical and testable without integration data.",
    sessionId: "devin-0e5ab9",
    sessionStatus: "running",
    deltaCoverage: 0.012,
    deltaMutation: 0.019,
  },
  {
    rank: 6,
    service: "audit-logger",
    path: "services/audit-logger/src/main/java/com/cbp/audit/ForwardingSink.java",
    owner: "Platform Controls",
    coverage: 0.36,
    mutationScore: 0.28,
    impact: 7.8,
    status: "approved",
    reason: "Failure handling can be tested with local fake sink.",
    sessionId: "devin-51db7e",
    sessionStatus: "blocked",
    deltaCoverage: 0.009,
    deltaMutation: 0.012,
  },
  {
    rank: 7,
    service: "reporting-aggregator",
    path: "services/reporting-aggregator/src/reporting_aggregator/exporters.py",
    owner: "Reg Reporting",
    coverage: 0.39,
    mutationScore: 0.33,
    impact: 7.4,
    status: "approved",
    reason: "CSV export rules have deterministic expected outputs.",
    sessionId: "devin-2fae88",
    sessionStatus: "queued",
    deltaCoverage: 0.008,
    deltaMutation: 0.01,
  },
  {
    rank: 8,
    service: "wire-transfer-service",
    path: "services/wire-transfer-service/src/main/java/com/cbp/wire/BatchSettlementJob.java",
    owner: "Wires",
    coverage: 0.29,
    mutationScore: 0.22,
    impact: 7.1,
    status: "rejected",
    reason: "Wires team is mid-migration; defer until service boundary freezes.",
    sessionId: "devin-policy",
    sessionStatus: "queued",
    deltaCoverage: 0,
    deltaMutation: 0,
  },
  {
    rank: 9,
    service: "auth-service",
    path: "services/auth-service/src/main/java/com/cbp/auth/JwtIssuer.java",
    owner: "Identity",
    coverage: 0.63,
    mutationScore: 0.52,
    impact: 6.8,
    status: "rejected",
    reason: "Touches token semantics; requires Identity approval before agent edits.",
    sessionId: "devin-policy",
    sessionStatus: "queued",
    deltaCoverage: 0,
    deltaMutation: 0,
  },
  {
    rank: 10,
    service: "transaction-processor",
    path: "services/transaction-processor/src/main/java/com/cbp/txn/PostingOrchestrator.java",
    owner: "Core Banking",
    coverage: 0.33,
    mutationScore: 0.26,
    impact: 6.5,
    status: "rejected",
    reason: "Integration-only test seam; needs harness work before parallelization.",
    sessionId: "devin-policy",
    sessionStatus: "queued",
    deltaCoverage: 0,
    deltaMutation: 0,
  },
]

export const demoPolicyRings: PolicyRing[] = [
  {
    ring: "ring0_readonly",
    autonomy: "Analyze only",
    scope: "All repos, coverage gaps, DeepWiki context",
    approval: "No approval required",
  },
  {
    ring: "ring1_low_risk_tests",
    autonomy: "Create tests + draft PR",
    scope: "Pure functions, fixtures, no production logic edits",
    approval: "Auto-approve kickoff; human reviews PR",
  },
  {
    ring: "ring2_compliance_paths",
    autonomy: "Parallel sessions with explicit triage",
    scope: "@ComplianceCritical services and ownership-aware boundaries",
    approval: "Human approves file list before kickoff",
  },
  {
    ring: "ring3_overnight",
    autonomy: "Scheduled long-horizon fleet",
    scope: "Policy-filtered backlog with budget and blast-radius limits",
    approval: "Agent self-rejects, escalates policy conflicts",
  },
]

export const demoOvernightDigest = {
  title: "Overnight coverage fleet digest",
  window: "2026-04-24 22:00–06:00 ET",
  sessions: 47,
  approved: 38,
  selfRejected: 9,
  policyBlocked: 1,
  prsOpened: 24,
  merged: 14,
  projectedCoverageDelta: 0.047,
  projectedMutationDelta: 0.038,
  blockedItem: {
    sessionId: "devin-4b8c10",
    path: "services/auth-service/src/main/java/com/cbp/auth/JwtIssuer.java",
    reason:
      "ring3_overnight denied token-signing logic; requires Identity owner approval.",
  },
}
