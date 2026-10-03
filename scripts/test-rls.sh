#!/usr/bin/env bash
# Runs the RLS school-isolation test against the database.
# Usage: SUPABASE_DB_URL="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" scripts/test-rls.sh
set -euo pipefail
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL (Supabase > Project Settings > Database > Connection string)}"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/../supabase/tests/rls_school_isolation.sql"
echo "RLS school isolation: PASS"
