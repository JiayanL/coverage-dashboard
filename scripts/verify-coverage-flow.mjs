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
    // account-service (9 files)
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/AccountServiceApplication.java", lang: "java", covered: 54, total: 170, pct: 0.3176 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/config/SecurityConfig.java", lang: "java", covered: 49, total: 155, pct: 0.3161 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/domain/Account.java", lang: "java", covered: 118, total: 309, pct: 0.3819 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/domain/AccountRepository.java", lang: "java", covered: 43, total: 74, pct: 0.5811 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/domain/AccountStatus.java", lang: "java", covered: 24, total: 77, pct: 0.3117 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/domain/AccountType.java", lang: "java", covered: 45, total: 141, pct: 0.3191 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/service/AccountNotFoundException.java", lang: "java", covered: 115, total: 317, pct: 0.3628 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/service/AccountService.java", lang: "java", covered: 71, total: 131, pct: 0.542 },
    { service: "account-service", path: "services/account-service/src/main/java/com/bofa/cbp/account/web/AccountController.java", lang: "java", covered: 71, total: 244, pct: 0.291 },
    // api-gateway (14 files)
    { service: "api-gateway", path: "services/api-gateway/src/app.ts", lang: "typescript", covered: 18, total: 142, pct: 0.1268 },
    { service: "api-gateway", path: "services/api-gateway/src/clients/accounts.ts", lang: "typescript", covered: 8, total: 33, pct: 0.2424 },
    { service: "api-gateway", path: "services/api-gateway/src/clients/notify.ts", lang: "typescript", covered: 43, total: 111, pct: 0.3874 },
    { service: "api-gateway", path: "services/api-gateway/src/clients/shared.ts", lang: "typescript", covered: 34, total: 109, pct: 0.3119 },
    { service: "api-gateway", path: "services/api-gateway/src/clients/wires.ts", lang: "typescript", covered: 31, total: 140, pct: 0.2214 },
    { service: "api-gateway", path: "services/api-gateway/src/config.ts", lang: "typescript", covered: 37, total: 77, pct: 0.4805 },
    { service: "api-gateway", path: "services/api-gateway/src/index.ts", lang: "typescript", covered: 71, total: 224, pct: 0.317 },
    { service: "api-gateway", path: "services/api-gateway/src/logger.ts", lang: "typescript", covered: 200, total: 339, pct: 0.59 },
    { service: "api-gateway", path: "services/api-gateway/src/metrics.ts", lang: "typescript", covered: 85, total: 165, pct: 0.5152 },
    { service: "api-gateway", path: "services/api-gateway/src/middleware/auth.ts", lang: "typescript", covered: 133, total: 304, pct: 0.4375 },
    { service: "api-gateway", path: "services/api-gateway/src/middleware/errorHandler.ts", lang: "typescript", covered: 12, total: 93, pct: 0.129 },
    { service: "api-gateway", path: "services/api-gateway/src/middleware/rateLimit.ts", lang: "typescript", covered: 155, total: 312, pct: 0.4968 },
    { service: "api-gateway", path: "services/api-gateway/src/middleware/requestId.ts", lang: "typescript", covered: 59, total: 180, pct: 0.3278 },
    { service: "api-gateway", path: "services/api-gateway/src/proxy.ts", lang: "typescript", covered: 97, total: 215, pct: 0.4512 },
    // audit-logger (6 files)
    { service: "audit-logger", path: "services/audit-logger/src/main/java/com/bofa/cbp/audit/AuditLoggerApplication.java", lang: "java", covered: 40, total: 325, pct: 0.1231 },
    { service: "audit-logger", path: "services/audit-logger/src/main/java/com/bofa/cbp/audit/controller/AuditController.java", lang: "java", covered: 47, total: 146, pct: 0.3219 },
    { service: "audit-logger", path: "services/audit-logger/src/main/java/com/bofa/cbp/audit/domain/AuditEvent.java", lang: "java", covered: 64, total: 178, pct: 0.3596 },
    { service: "audit-logger", path: "services/audit-logger/src/main/java/com/bofa/cbp/audit/repo/AuditEventRepository.java", lang: "java", covered: 48, total: 81, pct: 0.5926 },
    { service: "audit-logger", path: "services/audit-logger/src/main/java/com/bofa/cbp/audit/service/AuditWriter.java", lang: "java", covered: 62, total: 224, pct: 0.2768 },
    { service: "audit-logger", path: "services/audit-logger/src/main/java/com/bofa/cbp/audit/service/ForwardingSink.java", lang: "java", covered: 58, total: 216, pct: 0.2685 },
    // auth-service (11 files)
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/AuthServiceApplication.java", lang: "java", covered: 68, total: 113, pct: 0.6018 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/config/AdminSeedRunner.java", lang: "java", covered: 54, total: 166, pct: 0.3253 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/config/SecurityConfig.java", lang: "java", covered: 31, total: 66, pct: 0.4697 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/domain/UserAccount.java", lang: "java", covered: 50, total: 155, pct: 0.3226 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/domain/UserAccountRepository.java", lang: "java", covered: 38, total: 113, pct: 0.3363 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/service/AuthService.java", lang: "java", covered: 88, total: 315, pct: 0.2794 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/service/ForbiddenException.java", lang: "java", covered: 60, total: 142, pct: 0.4225 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/service/InvalidCredentialsException.java", lang: "java", covered: 16, total: 58, pct: 0.2759 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/service/PasswordPolicy.java", lang: "java", covered: 19, total: 147, pct: 0.1293 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/service/TokenService.java", lang: "java", covered: 121, total: 235, pct: 0.5149 },
    { service: "auth-service", path: "services/auth-service/src/main/java/com/bofa/cbp/auth/web/AuthController.java", lang: "java", covered: 25, total: 167, pct: 0.1497 },
    // customer-profile-api (10 files)
    { service: "customer-profile-api", path: "services/customer-profile-api/src/app.ts", lang: "typescript", covered: 199, total: 320, pct: 0.6219 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/audit.ts", lang: "typescript", covered: 86, total: 191, pct: 0.4503 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/exports.ts", lang: "typescript", covered: 95, total: 264, pct: 0.3598 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/index.ts", lang: "typescript", covered: 50, total: 103, pct: 0.4854 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/logger.ts", lang: "typescript", covered: 97, total: 317, pct: 0.306 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/masking.ts", lang: "typescript", covered: 131, total: 305, pct: 0.4295 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/search.ts", lang: "typescript", covered: 99, total: 328, pct: 0.3018 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/store.ts", lang: "typescript", covered: 121, total: 234, pct: 0.5171 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/types.ts", lang: "typescript", covered: 2, total: 100, pct: 0.02 },
    { service: "customer-profile-api", path: "services/customer-profile-api/src/validators.ts", lang: "typescript", covered: 206, total: 290, pct: 0.7103 },
    // kyc-enrichment (8 files)
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/admin.py", lang: "python", covered: 10, total: 86, pct: 0.1163 },
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/audit.py", lang: "python", covered: 41, total: 108, pct: 0.3796 },
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/clients.py", lang: "python", covered: 44, total: 246, pct: 0.1789 },
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/enrichment_pipeline.py", lang: "python", covered: 58, total: 335, pct: 0.1731 },
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/main.py", lang: "python", covered: 135, total: 269, pct: 0.5019 },
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/models.py", lang: "python", covered: 127, total: 300, pct: 0.4233 },
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/sanctions_scoring.py", lang: "python", covered: 13, total: 35, pct: 0.3714 },
    { service: "kyc-enrichment", path: "services/kyc-enrichment/src/kyc_enrichment/service.py", lang: "python", covered: 49, total: 88, pct: 0.5568 },
    // ledger-service (9 files)
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/LedgerServiceApplication.java", lang: "java", covered: 43, total: 166, pct: 0.259 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/domain/Journal.java", lang: "java", covered: 34, total: 204, pct: 0.1667 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/domain/Posting.java", lang: "java", covered: 120, total: 262, pct: 0.458 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/domain/PostingRepository.java", lang: "java", covered: 14, total: 31, pct: 0.4516 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/service/LedgerReportService.java", lang: "java", covered: 103, total: 164, pct: 0.628 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/service/LedgerService.java", lang: "java", covered: 71, total: 286, pct: 0.2483 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/service/UnbalancedJournalException.java", lang: "java", covered: 29, total: 84, pct: 0.3452 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/web/LedgerController.java", lang: "java", covered: 55, total: 350, pct: 0.1571 },
    { service: "ledger-service", path: "services/ledger-service/src/main/java/com/bofa/cbp/ledger/web/LedgerReportController.java", lang: "java", covered: 92, total: 341, pct: 0.2698 },
    // notification-service (7 files)
    { service: "notification-service", path: "services/notification-service/src/app.ts", lang: "typescript", covered: 64, total: 131, pct: 0.4885 },
    { service: "notification-service", path: "services/notification-service/src/delivery.ts", lang: "typescript", covered: 132, total: 306, pct: 0.4314 },
    { service: "notification-service", path: "services/notification-service/src/index.ts", lang: "typescript", covered: 149, total: 301, pct: 0.495 },
    { service: "notification-service", path: "services/notification-service/src/logger.ts", lang: "typescript", covered: 130, total: 280, pct: 0.4643 },
    { service: "notification-service", path: "services/notification-service/src/store.ts", lang: "typescript", covered: 7, total: 39, pct: 0.1795 },
    { service: "notification-service", path: "services/notification-service/src/templates.ts", lang: "typescript", covered: 74, total: 187, pct: 0.3957 },
    { service: "notification-service", path: "services/notification-service/src/validators.ts", lang: "typescript", covered: 58, total: 152, pct: 0.3816 },
    // reporting-aggregator (7 files)
    { service: "reporting-aggregator", path: "services/reporting-aggregator/src/reporting_aggregator/aggregations.py", lang: "python", covered: 46, total: 70, pct: 0.6571 },
    { service: "reporting-aggregator", path: "services/reporting-aggregator/src/reporting_aggregator/alerts.py", lang: "python", covered: 35, total: 73, pct: 0.4795 },
    { service: "reporting-aggregator", path: "services/reporting-aggregator/src/reporting_aggregator/app.py", lang: "python", covered: 101, total: 302, pct: 0.3344 },
    { service: "reporting-aggregator", path: "services/reporting-aggregator/src/reporting_aggregator/backfill.py", lang: "python", covered: 9, total: 94, pct: 0.0957 },
    { service: "reporting-aggregator", path: "services/reporting-aggregator/src/reporting_aggregator/exporters.py", lang: "python", covered: 150, total: 311, pct: 0.4823 },
    { service: "reporting-aggregator", path: "services/reporting-aggregator/src/reporting_aggregator/retention.py", lang: "python", covered: 56, total: 114, pct: 0.4912 },
    { service: "reporting-aggregator", path: "services/reporting-aggregator/src/reporting_aggregator/seed.py", lang: "python", covered: 83, total: 246, pct: 0.3374 },
    // session-manager (6 files)
    { service: "session-manager", path: "services/session-manager/src/index.ts", lang: "typescript", covered: 87, total: 138, pct: 0.6304 },
    { service: "session-manager", path: "services/session-manager/src/server.ts", lang: "typescript", covered: 73, total: 132, pct: 0.553 },
    { service: "session-manager", path: "services/session-manager/src/session.ts", lang: "typescript", covered: 41, total: 189, pct: 0.2169 },
    { service: "session-manager", path: "services/session-manager/src/sessionStore.ts", lang: "typescript", covered: 32, total: 221, pct: 0.1448 },
    { service: "session-manager", path: "services/session-manager/src/tokenRotation.ts", lang: "typescript", covered: 117, total: 254, pct: 0.4606 },
    { service: "session-manager", path: "services/session-manager/src/tokens.ts", lang: "typescript", covered: 72, total: 156, pct: 0.4615 },
    // transaction-processor (23 files)
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/TransactionProcessorApplication.java", lang: "java", covered: 12, total: 145, pct: 0.0828 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/controller/BatchController.java", lang: "java", covered: 65, total: 313, pct: 0.2077 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/controller/QueryController.java", lang: "java", covered: 28, total: 147, pct: 0.1905 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/controller/ReversalController.java", lang: "java", covered: 10, total: 60, pct: 0.1667 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/controller/TransactionController.java", lang: "java", covered: 25, total: 147, pct: 0.1701 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/domain/Transaction.java", lang: "java", covered: 43, total: 199, pct: 0.2161 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/domain/TransactionRequest.java", lang: "java", covered: 13, total: 66, pct: 0.197 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/domain/TransactionResult.java", lang: "java", covered: 16, total: 278, pct: 0.0576 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/domain/TransactionStatus.java", lang: "java", covered: 24, total: 139, pct: 0.1727 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/domain/TransactionType.java", lang: "java", covered: 6, total: 322, pct: 0.0186 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/events/EventEmitter.java", lang: "java", covered: 39, total: 325, pct: 0.12 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/events/TransactionEvent.java", lang: "java", covered: 5, total: 238, pct: 0.021 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/repository/TransactionRepository.java", lang: "java", covered: 29, total: 127, pct: 0.2283 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/BatchSubmissionService.java", lang: "java", covered: 76, total: 211, pct: 0.3602 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/CurrencyConverter.java", lang: "java", covered: 75, total: 246, pct: 0.3049 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/FraudHook.java", lang: "java", covered: 1, total: 57, pct: 0.0175 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/LedgerClient.java", lang: "java", covered: 27, total: 80, pct: 0.3375 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/LimitsService.java", lang: "java", covered: 34, total: 85, pct: 0.4 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/MetricsRecorder.java", lang: "java", covered: 42, total: 157, pct: 0.2675 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/ReversalService.java", lang: "java", covered: 25, total: 101, pct: 0.2475 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/TransactionProcessor.java", lang: "java", covered: 87, total: 246, pct: 0.3537 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/TransactionQueryService.java", lang: "java", covered: 17, total: 68, pct: 0.25 },
    { service: "transaction-processor", path: "services/transaction-processor/src/main/java/com/bofa/cbp/txn/service/VelocityTracker.java", lang: "java", covered: 85, total: 256, pct: 0.332 },
    // wire-transfer-service (12 files)
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/WireTransferServiceApplication.java", lang: "java", covered: 34, total: 80, pct: 0.425 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/domain/WireStatus.java", lang: "java", covered: 2, total: 55, pct: 0.0364 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/domain/WireTransfer.java", lang: "java", covered: 8, total: 37, pct: 0.2162 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/domain/WireTransferRepository.java", lang: "java", covered: 13, total: 77, pct: 0.1688 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/service/BatchSettlementService.java", lang: "java", covered: 66, total: 115, pct: 0.5739 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/service/FeeCalculator.java", lang: "java", covered: 44, total: 238, pct: 0.1849 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/service/SanctionsScreener.java", lang: "java", covered: 50, total: 235, pct: 0.2128 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/service/WireEventPublisher.java", lang: "java", covered: 20, total: 60, pct: 0.3333 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/service/WireNotFoundException.java", lang: "java", covered: 74, total: 229, pct: 0.3231 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/service/WireTransferService.java", lang: "java", covered: 54, total: 165, pct: 0.3273 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/web/WireAdminController.java", lang: "java", covered: 97, total: 176, pct: 0.5511 },
    { service: "wire-transfer-service", path: "services/wire-transfer-service/src/main/java/com/bofa/cbp/wire/web/WireTransferController.java", lang: "java", covered: 49, total: 246, pct: 0.1992 },
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
