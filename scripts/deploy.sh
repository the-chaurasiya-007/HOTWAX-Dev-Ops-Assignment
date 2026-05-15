#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/var/lib/jenkins/deployments/demo-app"
COMPOSE_FILE="docker-compose.ec2.yml"
SERVICE="${1:-}"

mkdir -p "$DEPLOY_DIR"
cp "$COMPOSE_FILE" "$DEPLOY_DIR/$COMPOSE_FILE"

if [ -n "$SERVICE" ]; then
  docker-compose -f "$DEPLOY_DIR/$COMPOSE_FILE" pull "$SERVICE"
  docker-compose -f "$DEPLOY_DIR/$COMPOSE_FILE" up -d "$SERVICE"
else
  docker-compose -f "$DEPLOY_DIR/$COMPOSE_FILE" pull
  docker-compose -f "$DEPLOY_DIR/$COMPOSE_FILE" up -d
fi
