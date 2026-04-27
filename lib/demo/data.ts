export type DemoRecommendation = {
  rank: number
  service: string
  path: string
  owner: string
  ownerHandle?: string
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
  // Populated only when sessionStatus === "blocked". The fleet view renders
  // this as a callout so the live "stuck session" beat in Act 2 has a
  // concrete narration target.
  blocker?: string
  // OCC compliance category from consumer-banking-platform's
  // tools/compliance_map.json. Lets the UI / digest / triage playbook group
  // findings by control point.
  complianceCategory?:
    | "TRANSACTION_INTEGRITY"
    | "AUTHENTICATION"
    | "PII_HANDLING"
    | "AUDIT_TRAIL"
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
    ownerHandle: "@bofa/payments-team",
    coverage: 0.41,
    mutationScore: 0.34,
    impact: 9.8,
    status: "approved",
    reason:
      "OCC TRANSACTION_INTEGRITY screener — high blast radius, stable owner surface, deterministic test seam.",
    sessionId: "devin-8f2a91",
    sessionStatus: "pr-opened",
    pr: "#18",
    deltaCoverage: 0.036,
    deltaMutation: 0.041,
    complianceCategory: "TRANSACTION_INTEGRITY",
  },
  {
    rank: 2,
    service: "ledger-service",
    path: "services/ledger-service/src/main/java/com/cbp/ledger/DoubleEntryValidator.java",
    owner: "Core Ledger",
    ownerHandle: "@bofa/payments-team @bofa/finance-systems",
    coverage: 0.52,
    mutationScore: 0.46,
    impact: 9.2,
    status: "approved",
    reason:
      "Invariant-heavy code — pure validator with strong oracles; mutation lift expected.",
    sessionId: "devin-1c77d4",
    sessionStatus: "merged",
    pr: "#19",
    deltaCoverage: 0.021,
    deltaMutation: 0.031,
    complianceCategory: "TRANSACTION_INTEGRITY",
  },
  {
    rank: 3,
    service: "kyc-enrichment",
    path: "services/kyc-enrichment/src/kyc_enrichment/risk_scoring.py",
    owner: "Financial Crimes",
    ownerHandle: "@bofa/data-platform",
    coverage: 0.48,
    mutationScore: 0.39,
    impact: 8.9,
    status: "approved",
    reason:
      "Pure scoring function — strong expected-output oracle from existing fixtures.",
    sessionId: "devin-a6402b",
    sessionStatus: "running",
    deltaCoverage: 0.018,
    deltaMutation: 0.023,
    complianceCategory: "PII_HANDLING",
  },
  {
    rank: 4,
    service: "account-service",
    path: "services/account-service/src/main/java/com/cbp/account/AccountLifecycleService.java",
    owner: "Deposits",
    ownerHandle: "@bofa/retail-accounts",
    coverage: 0.57,
    mutationScore: 0.49,
    impact: 8.4,
    status: "approved",
    reason: "Regression surface for account holds and closures; H2 fixtures already exist.",
    sessionId: "devin-c338a0",
    sessionStatus: "pr-opened",
    pr: "#20",
    deltaCoverage: 0.014,
    deltaMutation: 0.017,
  },
  {
    rank: 5,
    service: "customer-profile-api",
    path: "services/customer-profile-api/src/masking.ts",
    owner: "Customer 360",
    ownerHandle: "@bofa/retail-accounts",
    coverage: 0.44,
    mutationScore: 0.31,
    impact: 8.1,
    status: "approved",
    reason:
      "PII masking — business-critical, no integration data needed, Jest seam is clean.",
    sessionId: "devin-0e5ab9",
    sessionStatus: "running",
    deltaCoverage: 0.012,
    deltaMutation: 0.019,
    complianceCategory: "PII_HANDLING",
  },
  {
    rank: 6,
    service: "audit-logger",
    path: "services/audit-logger/src/main/java/com/cbp/audit/ForwardingSink.java",
    owner: "Platform Controls",
    ownerHandle: "@bofa/platform-security @bofa/compliance-eng",
    coverage: 0.36,
    mutationScore: 0.28,
    impact: 7.8,
    status: "approved",
    reason:
      "Failure-handling path is testable with a local fake sink; ties to PLAT-1808 finding on swallowed errors.",
    sessionId: "devin-51db7e",
    sessionStatus: "blocked",
    deltaCoverage: 0.009,
    deltaMutation: 0.012,
    blocker:
      "Devin hit a LedgerClient stub conflict in ForwardingSinkTest (mocked sink + real Spring context). 9m in this state — escalating to Platform Controls.",
    complianceCategory: "AUDIT_TRAIL",
  },
  {
    rank: 7,
    service: "reporting-aggregator",
    path: "services/reporting-aggregator/src/reporting_aggregator/exporters.py",
    owner: "Reg Reporting",
    ownerHandle: "@bofa/finance-systems",
    coverage: 0.39,
    mutationScore: 0.33,
    impact: 7.4,
    status: "approved",
    reason:
      "CSV export rules have deterministic golden-file outputs; pytest seam is straightforward.",
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
    ownerHandle: "@bofa/payments-team",
    coverage: 0.29,
    mutationScore: 0.22,
    impact: 7.1,
    status: "rejected",
    reason:
      "Wires team is mid-migration (Spring Boot 2.7 → 3.x, PLAT-1440). We don't want Devin touching it until the service boundary freezes.",
    sessionId: "devin-policy",
    sessionStatus: "queued",
    deltaCoverage: 0,
    deltaMutation: 0,
    complianceCategory: "TRANSACTION_INTEGRITY",
  },
  {
    rank: 9,
    service: "auth-service",
    path: "services/auth-service/src/main/java/com/cbp/auth/JwtIssuer.java",
    owner: "Identity",
    ownerHandle: "@bofa/identity-platform",
    coverage: 0.63,
    mutationScore: 0.52,
    impact: 6.8,
    status: "rejected",
    reason:
      "Touches token-signing semantics. Identity Platform owner-approval required before any agent edit — and PLAT-1912 (cross-language exp drift) is still open.",
    sessionId: "devin-policy",
    sessionStatus: "queued",
    deltaCoverage: 0,
    deltaMutation: 0,
    complianceCategory: "AUTHENTICATION",
  },
  {
    rank: 10,
    service: "transaction-processor",
    path: "services/transaction-processor/src/main/java/com/cbp/txn/PostingOrchestrator.java",
    owner: "Core Banking",
    ownerHandle: "@bofa/payments-team",
    coverage: 0.33,
    mutationScore: 0.26,
    impact: 6.5,
    status: "rejected",
    reason:
      "Integration-only test seam (PLAT-1730-a, concurrency unverified). Needs harness work before parallel agents make sense.",
    sessionId: "devin-policy",
    sessionStatus: "queued",
    deltaCoverage: 0,
    deltaMutation: 0,
    complianceCategory: "TRANSACTION_INTEGRITY",
  },
]

export const demoPolicyRings: PolicyRing[] = [
  {
    ring: "ring0_readonly",
    autonomy: "Analyze only",
    scope: "All repos · coverage gaps · DeepWiki context",
    approval: "No approval required",
  },
  {
    ring: "ring1_low_risk_tests",
    autonomy: "Create tests + draft PR",
    scope: "Pure functions, fixtures, no production-logic edits",
    approval: "Auto-approve kickoff · human reviews PR",
  },
  {
    ring: "ring2_compliance_paths",
    autonomy: "Parallel sessions with explicit triage",
    scope: "@ComplianceCritical services with stable owners",
    approval: "Human approves file list before kickoff",
  },
  {
    ring: "ring3_overnight",
    autonomy: "Scheduled long-horizon fleet",
    scope: "Policy-filtered backlog · budget + blast-radius limits",
    approval: "Agent self-rejects, escalates policy conflicts",
  },
]

export const demoOvernightDigest = {
  title: "Overnight coverage fleet digest",
  window: "2026-04-24 22:00 → 06:00 ET",
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
      "ring3_overnight denied token-signing logic — requires Identity owner approval (cross-references PLAT-1912 open finding).",
  },
  selfRejectedSamples: [
    {
      sessionId: "devin-9a01ee",
      path: "services/transaction-processor/src/main/java/com/cbp/txn/FraudHook.java",
      reason:
        "Self-rejected: detected stub `LedgerClient` not protected by per-account lock (PLAT-1730-a). Out of harness scope.",
    },
    {
      sessionId: "devin-71b3c2",
      path: "services/pii-tokenization-service/src/pii_tokenization/hsm.py",
      reason:
        "Self-rejected: no pytest scaffolding present (PLAT-1871). Ring0 read-only output filed instead.",
    },
  ],
}

// Single-file artifact for the Act 1 narration. Visible on Overview as proof
// of the "one engineer with Devin on one file" beat — same dashboard, just
// zoomed in to one file before we widen out to the fleet view.
export const demoActOneEvidence = {
  service: "customer-profile-api",
  path: "services/customer-profile-api/src/masking.ts",
  owner: "Customer 360",
  ownerHandle: "@bofa/retail-accounts",
  prTitle: "test(customer-profile-api): cover PII masking edge cases",
  prNumber: "#14",
  beforeCoverage: 0.41,
  afterCoverage: 0.89,
  beforeMutation: 0.31,
  afterMutation: 0.63,
  durationMinutes: 12,
  mergedRelative: "12m ago",
  testCount: 14,
  complianceCategory: "PII_HANDLING" as const,
}
