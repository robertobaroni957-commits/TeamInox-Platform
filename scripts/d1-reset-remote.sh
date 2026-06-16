#!/bin/bash

DB="team_inox_prod_v2"

echo "🧨 Disabling foreign keys..."
wrangler d1 execute $DB --remote --command "PRAGMA foreign_keys = OFF;"

echo "🧹 Dropping tables safely..."

TABLES=$(wrangler d1 execute $DB --remote --command "SELECT name FROM sqlite_master WHERE type='table';" | grep -v name | grep -v sqlite_sequence | grep -v d1_migrations | tr -d '│├└─ ')

for t in $TABLES
do
  echo "Dropping $t"
  wrangler d1 execute $DB --remote --command "DROP TABLE IF EXISTS \"$t\";"
done

echo "📦 Re-applying migrations..."
wrangler d1 migrations apply $DB --remote

echo "✅ Reset complete"