const dashboardUrl = process.env.COVERAGE_DASHBOARD_URL ?? "http://localhost:3000"
const ingestToken = process.env.INGEST_TOKEN
const dashboardPassword = process.env.DASHBOARD_PASSWORD

if (!ingestToken) {
  throw new Error("INGEST_TOKEN is required")
}

const suffix = String(Date.now())
const repo = process.env.COVERAGE_FLOW_REPO ?? "JiayanL/consumer-banking-platform"
const payload = {
  repo,
  display_name: repo.split("/").at(-1) ?? repo,
  kind: "monorepo",
  sha: `devine2e${suffix}`,
  ref: "refs/heads/main",
  run_id: `devin-e2e-${suffix}`,
  timestamp: new Date().toISOString(),
  overall: {
    covered: 3287,
    total: 10000,
    pct: 0.3287,
    mutation: { killed: 284, total: 900, score: 0.3156 },
  },
  services: {
    "account-service": {
      lang: "java",
      description: "Spring Boot account CRUD, balance inquiry, and freeze/unfreeze lifecycle over H2.",
      covered: 340,
      total: 1000,
      pct: 0.34,
      mutation: { killed: 31, total: 90, score: 31 / 90 },
    },
    "auth-service": {
      lang: "java",
      description: "Spring Boot HS256 JWT login, refresh, introspection, and admin registration service.",
      covered: 396,
      total: 1000,
      pct: 0.396,
      mutation: { killed: 36, total: 90, score: 0.4 },
    },
    "ledger-service": {
      lang: "java",
      description: "Double-entry journal submission, posting queries, and derived balance enforcement.",
      covered: 335,
      total: 1000,
      pct: 0.335,
      mutation: { killed: 32, total: 90, score: 32 / 90 },
    },
    "wire-transfer-service": {
      lang: "java",
      description: "Spring Boot 2.7 wire initiation, lookup, cancellation, and H2-backed payment workflow.",
      covered: 317,
      total: 1000,
      pct: 0.317,
      mutation: { killed: 28, total: 90, score: 28 / 90 },
    },
    "transaction-processor": {
      lang: "java",
      description: "Primary money-movement path for idempotency, limits, fraud hooks, ledger posting, and reversals.",
      covered: 180,
      total: 1000,
      pct: 0.18,
      mutation: { killed: 14, total: 90, score: 14 / 90 },
    },
    "audit-logger": {
      lang: "java",
      description: "Append-only audit event write path with downstream immutable archive forwarding.",
      covered: 305,
      total: 1000,
      pct: 0.305,
      mutation: { killed: 27, total: 80, score: 27 / 80 },
    },
    "api-gateway": {
      lang: "typescript",
      description: "Public Express gateway for auth header checks, request IDs, and stubbed downstream routing.",
      covered: 352,
      total: 1000,
      pct: 0.352,
      mutation: { killed: 33, total: 90, score: 33 / 90 },
    },
    "customer-profile-api": {
      lang: "typescript",
      description: "Customer profile CRUD and communication preferences using in-memory storage.",
      covered: 318,
      total: 1000,
      pct: 0.318,
      mutation: { killed: 29, total: 90, score: 29 / 90 },
    },
    "notification-service": {
      lang: "typescript",
      description: "Sandbox email/SMS notification templates and in-memory delivery records.",
      covered: 287,
      total: 1000,
      pct: 0.287,
      mutation: { killed: 24, total: 80, score: 0.3 },
    },
    "session-manager": {
      lang: "typescript",
      description: "Session lifecycle and JWT issuance with idle reaping semantics.",
      covered: 326,
      total: 1000,
      pct: 0.326,
      mutation: { killed: 30, total: 90, score: 1 / 3 },
    },
    "kyc-enrichment": {
      lang: "python",
      description: "FastAPI KYC enrichment with sanctions/PEP stubs, risk tiers, and PII utilities.",
      covered: 365,
      total: 1000,
      pct: 0.365,
      mutation: { killed: 35, total: 90, score: 35 / 90 },
    },
    "reporting-aggregator": {
      lang: "python",
      description: "Flask daily/monthly transaction aggregation, flagged transaction reporting, and account totals.",
      covered: 366,
      total: 1000,
      pct: 0.366,
      mutation: { killed: 25, total: 60, score: 25 / 60 },
    },
  },
  files: [
    {
      service: "transaction-processor",
      path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/TransactionProcessor.java",
      lang: "java",
      covered: 36,
      total: 220,
      pct: 0.1636,
    },
    {
      service: "wire-transfer-service",
      path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/service/WireTransferService.java",
      lang: "java",
      covered: 87,
      total: 280,
      pct: 0.3107,
    },
    {
      service: "kyc-enrichment",
      path: "services/kyc-enrichment/src/kyc_enrichment/main.py",
      lang: "python",
      covered: 94,
      total: 260,
      pct: 0.3615,
    },
    {
      service: "api-gateway",
      path: "services/api-gateway/src/app.ts",
      lang: "typescript",
      covered: 102,
      total: 290,
      pct: 0.3517,
    },
  ],
  test_summary: {
    services: {
      "account-service": { lang: "java", run: 42, passed: 42, failed: 0, errors: 0, skipped: 0 },
      "auth-service": { lang: "java", run: 38, passed: 38, failed: 0, errors: 0, skipped: 0 },
      "ledger-service": { lang: "java", run: 31, passed: 30, failed: 1, errors: 0, skipped: 0 },
      "wire-transfer-service": { lang: "java", run: 34, passed: 33, failed: 1, errors: 0, skipped: 0 },
      "transaction-processor": { lang: "java", run: 19, passed: 18, failed: 1, errors: 0, skipped: 0 },
      "audit-logger": { lang: "java", run: 23, passed: 23, failed: 0, errors: 0, skipped: 0 },
      "api-gateway": { lang: "typescript", run: 28, passed: 28, failed: 0, errors: 0, skipped: 0 },
      "customer-profile-api": { lang: "typescript", run: 17, passed: 17, failed: 0, errors: 0, skipped: 0 },
      "notification-service": { lang: "typescript", run: 14, passed: 14, failed: 0, errors: 0, skipped: 0 },
      "session-manager": { lang: "typescript", run: 21, passed: 20, failed: 1, errors: 0, skipped: 0 },
      "kyc-enrichment": { lang: "python", run: 26, passed: 26, failed: 0, errors: 0, skipped: 0 },
      "reporting-aggregator": { lang: "python", run: 22, passed: 22, failed: 0, errors: 0, skipped: 0 },
    },
  },
}

const ingest = await fetch(new URL("/api/ingest/coverage", dashboardUrl), {
  method: "POST",
  headers: {
    authorization: `Bearer ${ingestToken}`,
    "content-type": "application/json",
  },
  body: JSON.stringify(payload),
})

if (!ingest.ok) {
  throw new Error(`ingest failed: ${ingest.status} ${await ingest.text()}`)
}

const ingestResult = await ingest.json()
console.log("ingested", ingestResult)

const headers = new Headers()
if (dashboardPassword) {
  const salt = "coverage-dashboard-cookie-v1"
  const data = new TextEncoder().encode(`${dashboardPassword}::${salt}`)
  const digest = await crypto.subtle.digest("SHA-256", data)
  const token = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  headers.set("cookie", `coverage-dashboard-auth=${token}`)
}

for (const path of [
  "/",
  "/repositories",
  "/coverage",
  `/repositories/${repo.split("/").map(encodeURIComponent).join("/")}`,
]) {
  const response = await fetch(new URL(path, dashboardUrl), { headers })
  const html = await response.text()
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }
  if (!html.includes(payload.display_name) && !html.includes(repo)) {
    throw new Error(`${path} did not render ${repo}`)
  }
  if (path.includes("/coverage") && !html.includes("transaction-processor")) {
    throw new Error(`${path} did not render ingested service rows`)
  }
  console.log("rendered", path)
}
