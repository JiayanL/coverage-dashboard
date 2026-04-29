export const OCC_GATE_PCT = 0.70 // 70% target

export type ComplianceCategory =
  | "TRANSACTION_INTEGRITY"
  | "AUTHENTICATION"
  | "PII_HANDLING"
  | "AUDIT_TRAIL"

export const COMPLIANCE_CATEGORIES: Record<
  ComplianceCategory,
  { label: string; description: string }
> = {
  TRANSACTION_INTEGRITY: {
    label: "Transaction Integrity",
    description:
      "Debit/credit posting, double-entry ledger, wire initiation, reversal handling",
  },
  AUTHENTICATION: {
    label: "Authentication",
    description: "Token issuance, token validation, role-based access checks",
  },
  PII_HANDLING: {
    label: "PII Handling",
    description:
      "Tokenization of SSN/DOB/account numbers, masking, hashing, KYC lookups",
  },
  AUDIT_TRAIL: {
    label: "Audit Trail",
    description:
      "Write-path for audit events, retention, forwarding to archive",
  },
}

/** Mirrors tools/compliance_map.json from consumer-banking-platform. */
export const SERVICE_CATEGORY_MAP: Record<string, ComplianceCategory[]> = {
  "transaction-processor": ["TRANSACTION_INTEGRITY"],
  "ledger-service": ["TRANSACTION_INTEGRITY"],
  "wire-transfer-service": ["TRANSACTION_INTEGRITY"],
  "auth-service": ["AUTHENTICATION"],
  "session-manager": ["AUTHENTICATION"],
  "audit-logger": ["AUDIT_TRAIL"],
  "pii-tokenization-service": ["PII_HANDLING"],
  "kyc-enrichment": ["PII_HANDLING"],
  "reporting-aggregator": ["PII_HANDLING"],
}
