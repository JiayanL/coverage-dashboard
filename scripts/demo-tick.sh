#!/usr/bin/env bash
# Advance the staged Act 2 / Act 3 coverage trend by one beat (or seed all
# four beats at once). Used during the live demo to make the coverage +
# mutation lines visibly tick on stage.
#
# Usage:
#   DEMO_MODE=1 scripts/demo-tick.sh 0      # baseline
#   DEMO_MODE=1 scripts/demo-tick.sh 1      # approved PRs land
#   DEMO_MODE=1 scripts/demo-tick.sh 2      # blocked session unblocks
#   DEMO_MODE=1 scripts/demo-tick.sh 3      # overnight digest landed
#   DEMO_MODE=1 scripts/demo-tick.sh all    # seed all 4 in order
#
# The endpoint requires either DEMO_MODE=1 or an Authorization: Bearer
# matching $INGEST_TOKEN. If $INGEST_TOKEN is set this script forwards it.
set -euo pipefail

step="${1:-}"
if [[ -z "${step}" ]]; then
  echo "usage: $0 <0|1|2|3|all>" >&2
  exit 2
fi

base_url="${COVERAGE_DASHBOARD_URL:-http://localhost:3000}"
auth_args=()
if [[ -n "${INGEST_TOKEN:-}" ]]; then
  auth_args+=("-H" "Authorization: Bearer ${INGEST_TOKEN}")
fi

if [[ "${step}" == "all" ]]; then
  url="${base_url}/api/demo/coverage-step?all=1"
else
  case "${step}" in
    0|1|2|3) ;;
    *)
      echo "error: step must be one of 0, 1, 2, 3, or 'all' (got '${step}')" >&2
      exit 2
      ;;
  esac
  url="${base_url}/api/demo/coverage-step?step=${step}"
fi

echo "POST ${url}" >&2
# `${arr[@]+...}` form: expand only when the array is set, so this stays
# safe under `set -u` on bash < 4.4 (e.g. macOS default bash 3.2).
curl -sS -X POST ${auth_args[@]+"${auth_args[@]}"} "${url}"
echo
