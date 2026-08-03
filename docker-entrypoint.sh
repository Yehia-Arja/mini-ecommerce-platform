#!/bin/sh
set -eu

node dist/db/runMigrations.js
exec node dist/server.js
