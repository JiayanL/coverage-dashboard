This is a coverage dashboard that ingests automated test and coverage output into Neon and renders repository, service, mutation, and test-pass health in a Next.js dashboard.

## End-to-end coverage flow

Automated test jobs should aggregate their coverage output into the JSON contract below, then `POST` it to `/api/ingest/coverage` with an `Authorization: Bearer $INGEST_TOKEN` header. The ingest route validates the payload, writes the repository/run/service/file rows to Neon in one transaction, and the dynamic dashboard pages read the latest Neon rows on each request.

```bash
curl -X POST "$COVERAGE_DASHBOARD_URL/api/ingest/coverage" \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  --data @coverage-dashboard-payload.json
```

Minimal payload:

```json
{
  "repo": "JiayanL/consumer-banking-platform",
  "display_name": "consumer-banking-platform",
  "kind": "monorepo",
  "sha": "0123456789abcdef",
  "ref": "refs/heads/main",
  "run_id": "github-actions-123456789",
  "timestamp": "2026-04-27T16:30:00.000Z",
  "overall": {
    "covered": 1620,
    "total": 2000,
    "pct": 0.81,
    "mutation": { "killed": 72, "total": 100, "score": 0.72 }
  },
  "services": {
    "account-service": {
      "lang": "java",
      "covered": 900,
      "total": 1000,
      "pct": 0.9,
      "mutation": { "killed": 55, "total": 70, "score": 0.7857 }
    }
  },
  "files": [
    {
      "service": "account-service",
      "path": "services/account-service/src/main/java/com/cbp/account/AccountService.java",
      "lang": "java",
      "covered": 450,
      "total": 500,
      "pct": 0.9
    }
  ],
  "test_summary": {
    "services": {
      "account-service": {
        "lang": "java",
        "run": 118,
        "passed": 118,
        "failed": 0,
        "errors": 0,
        "skipped": 0
      }
    }
  }
}
```

Expected data path:

1. CI runs tests and coverage tooling, then emits this payload.
2. `/api/ingest/coverage` validates `INGEST_TOKEN` and the payload shape.
3. Neon stores one `repository`, one upserted `coverage_run`, and replaced dependent `coverage_service` / `coverage_file` rows for that run.
4. `/`, `/repositories`, `/coverage`, and `/repositories/:owner/:repo` read the newest Neon run with `force-dynamic` rendering.

## Getting Started

Set the required local environment variables, then run the development server:

```bash
export DATABASE_URL="$COVERAGE_DASHBOARD_DATABASE_URL"
export INGEST_TOKEN="local-ingest-token"
export DASHBOARD_PASSWORD="local-dashboard-password"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To prove the complete flow locally against a running dashboard, set `DATABASE_URL`, `INGEST_TOKEN`, and `DASHBOARD_PASSWORD`, then run:

```bash
npm run verify:coverage-flow
```

The script posts a synthetic CI-style payload, then verifies the overview, repository, coverage, and repository detail pages render the ingested repository and services.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
