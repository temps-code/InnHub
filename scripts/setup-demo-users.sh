#!/usr/bin/env bash
# =============================================================================
# Setup Demo Users — InnHub
# Creates 10 demo auth users (5 roles × 2 properties) via InsForge REST API.
#
# Idempotent: skips existing users. Outputs UUID mapping to JSON for seed.sql.
#
# Usage:
#   export INSFORGE_URL="https://<project>.us-east.insforge.app"
#   bash scripts/setup-demo-users.sh
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────

: "${INSFORGE_URL:?Missing INSFORGE_URL — set to your InsForge project URL}"
PASSWORD="${DEMO_PASSWORD:-Demo123!}"
OUTPUT_FILE="${DEMO_UUID_FILE:-scripts/demo-user-uuids.json}"

# ── User list ────────────────────────────────────────────────────────────────
# Deterministic order: sorted alphabetically by email

USERS_CSV="\
admin+loschapacos-admin@innhub.dev,H. Los Chapacos — Administrator
admin+loschapacos-housekeep@innhub.dev,H. Los Chapacos — Housekeeping
admin+loschapacos-maintenance@innhub.dev,H. Los Chapacos — Maintenance
admin+loschapacos-manager@innhub.dev,H. Los Chapacos — Manager
admin+loschapacos-reception@innhub.dev,H. Los Chapacos — Receptionist
admin+tarija-admin@innhub.dev,Hotel Tarija — Administrator
admin+tarija-housekeep@innhub.dev,Hotel Tarija — Housekeeping
admin+tarija-maintenance@innhub.dev,Hotel Tarija — Maintenance
admin+tarija-manager@innhub.dev,Hotel Tarija — Manager
admin+tarija-reception@innhub.dev,Hotel Tarija — Receptionist"

# ── Helpers ──────────────────────────────────────────────────────────────────

log()  { echo "[setup-users] $*" >&2; }
die()  { log "ERROR: $*"; exit 1; }

create_or_resolve() {
  local email="$1" name="$2"
  local resp uuid http_code

  # Step 1: try register (POST /api/auth/users)
  resp=$(curl -s -w "\n%{http_code}" -X POST "${INSFORGE_URL}/api/auth/users" \
    -H "Content-Type: application/json" \
    -d "$(cat <<END
{"email": "${email}", "password": "${PASSWORD}", "name": "${name}"}
END
)")
  http_code=$(echo "$resp" | tail -1)
  resp_body=$(echo "$resp" | sed '$d')

  if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    # New user created — extract UUID from response
    uuid=$(echo "$resp_body" | python3 -c "
import sys, json
data = json.load(sys.stdin)
uid = data.get('user', {}).get('id', '')
print(uid)
" 2>/dev/null) || die "Failed to parse register response for ${email}"
    log "Created: ${email} → ${uuid}"
    echo "${email}|${uuid}"
    return 0
  fi

  # Step 2: if exists, resolve UUID via login
  if echo "$resp_body" | python3 -c "import sys,json;d=json.load(sys.stdin);exit(0 if d.get('statusCode')==409 else 1)" 2>/dev/null; then
    log "Exists: ${email} — resolving UUID via login..."
    login_resp=$(curl -s -X POST "${INSFORGE_URL}/api/auth/sessions" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"${email}\", \"password\": \"${PASSWORD}\"}")
    uuid=$(echo "$login_resp" | python3 -c "
import sys, json
data = json.load(sys.stdin)
uid = data.get('user', {}).get('id', '')
if not uid:
    print('FAIL')
else:
    print(uid)
" 2>/dev/null) || die "Failed to parse login response for ${email}"
    if [ "$uuid" = "FAIL" ]; then
      die "Cannot resolve UUID for ${email} — login failed"
    fi
    log "Resolved: ${email} → ${uuid}"
    echo "${email}|${uuid}"
    return 0
  fi

  die "Unexpected register response (HTTP ${http_code}) for ${email}: $(echo "$resp_body" | head -c 200)"
}

# ── Main ─────────────────────────────────────────────────────────────────────

log "=== InnHub Demo Users Setup ==="
log "URL: ${INSFORGE_URL}"
log ""

declare -a ENTRIES

while IFS= read -r line; do
  [ -z "$line" ] && continue
  email="${line%%,*}"
  name="${line#*,}"
  entry=$(create_or_resolve "$email" "$name")
  ENTRIES+=("$entry")
done <<< "$USERS_CSV"

# Build JSON output via Python for correctness
python3 <<END
import json

entries = []
for e in """$(printf "%s\n" "${ENTRIES[@]}")""".strip().split('\n'):
    if not e.strip():
        continue
    parts = e.split('|', 1)
    if len(parts) == 2:
        entries.append({"email": parts[0], "uuid": parts[1]})

with open("${OUTPUT_FILE}", "w") as f:
    json.dump(entries, f, indent=2)

print(f"Wrote {len(entries)} UUID mappings to ${OUTPUT_FILE}")
END

log ""
log "=== Done ==="
log "Next: apply seed.sql via InsForge MCP"
log "  insforge_run-raw-sql(query: \"<seed.sql>\", apiKey: \"<admin-key>\")"
