const dashboardUrl = process.env.COVERAGE_DASHBOARD_URL ?? "http://localhost:3000"
const ingestToken = process.env.INGEST_TOKEN
const dashboardPassword = process.env.DASHBOARD_PASSWORD

if (!ingestToken) {
  throw new Error("INGEST_TOKEN is required")
}

const suffix = String(Date.now())
const repo = process.env.COVERAGE_FLOW_REPO ?? "JiayanL/coverage-dashboard-e2e"
const payload = {
  repo,
  display_name: repo.split("/").at(-1) ?? repo,
  kind: "monorepo",
  sha: `devine2e${suffix}`,
  ref: "refs/heads/devin/e2e-flow",
  run_id: `devin-e2e-${suffix}`,
  timestamp: new Date().toISOString(),
  overall: {
    covered: 1620,
    total: 2000,
    pct: 0.81,
    mutation: { killed: 72, total: 100, score: 0.72 },
  },
  services: {
    "automated-tests-api": {
      lang: "typescript",
      covered: 900,
      total: 1000,
      pct: 0.9,
      mutation: { killed: 55, total: 70, score: 55 / 70 },
    },
    "neon-flow-worker": {
      lang: "typescript",
      covered: 720,
      total: 1000,
      pct: 0.72,
      mutation: { killed: 17, total: 30, score: 17 / 30 },
    },
  },
  files: [
    {
      service: "automated-tests-api",
      path: "tests/e2e/coverage-flow.spec.ts",
      lang: "typescript",
      covered: 450,
      total: 500,
      pct: 0.9,
    },
    {
      service: "neon-flow-worker",
      path: "src/coverage/neon-persist.ts",
      lang: "typescript",
      covered: 360,
      total: 500,
      pct: 0.72,
    },
  ],
  test_summary: {
    services: {
      "automated-tests-api": {
        lang: "typescript",
        run: 118,
        passed: 118,
        failed: 0,
        errors: 0,
        skipped: 0,
      },
      "neon-flow-worker": {
        lang: "typescript",
        run: 64,
        passed: 63,
        failed: 1,
        errors: 0,
        skipped: 0,
      },
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
  if (path.includes("/coverage") && !html.includes("automated-tests-api")) {
    throw new Error(`${path} did not render ingested service rows`)
  }
  console.log("rendered", path)
}
