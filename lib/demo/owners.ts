// Static owner directory used by the Act 2 fleet view, the Act 3 digest, and
// rejection reasons. Mirrors `consumer-banking-platform/CODEOWNERS` so the
// demo narration ("the Wires team is mid-migration") is grounded in a real-
// looking ownership map rather than free-form strings.
export type OwnerEntry = {
  team: string // e.g. "Wires", "Identity Platform"
  handle: string // GitHub team handle, e.g. "@bofa/payments-team"
  status: "stable" | "mid-migration" | "owner-locked" | "no-test-infra"
  notes?: string
}

export const cbpOwners: Record<string, OwnerEntry> = {
  "Payments Platform": {
    team: "Payments Platform",
    handle: "@bofa/payments-team",
    status: "stable",
  },
  "Core Ledger": {
    team: "Core Ledger",
    handle: "@bofa/payments-team @bofa/finance-systems",
    status: "stable",
  },
  "Financial Crimes": {
    team: "Financial Crimes",
    handle: "@bofa/data-platform",
    status: "stable",
  },
  Deposits: {
    team: "Deposits",
    handle: "@bofa/retail-accounts",
    status: "stable",
  },
  "Customer 360": {
    team: "Customer 360",
    handle: "@bofa/retail-accounts",
    status: "stable",
  },
  "Platform Controls": {
    team: "Platform Controls",
    handle: "@bofa/platform-security @bofa/compliance-eng",
    status: "stable",
  },
  "Reg Reporting": {
    team: "Reg Reporting",
    handle: "@bofa/finance-systems",
    status: "stable",
  },
  Wires: {
    team: "Wires",
    handle: "@bofa/payments-team",
    status: "mid-migration",
    notes: "Spring Boot 2.7 → 3.x migration in flight (PLAT-1440).",
  },
  Identity: {
    team: "Identity Platform",
    handle: "@bofa/identity-platform",
    status: "owner-locked",
    notes: "Token-issuance code requires explicit Identity owner approval.",
  },
  "Core Banking": {
    team: "Core Banking",
    handle: "@bofa/payments-team",
    status: "stable",
    notes: "Integration-test seam — needs harness work before parallel agents.",
  },
  "Data Security": {
    team: "Data Security",
    handle: "@bofa/data-security",
    status: "no-test-infra",
    notes: "pii-tokenization-service has no pytest scaffolding (PLAT-1871).",
  },
}
