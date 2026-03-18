#!/bin/bash

# Health check script for monitoring deployment status
# Usage: ./scripts/health-check.sh [environment]

set -e

ENVIRONMENT=${1:-staging}
TIMEOUT=${2:-30}
INTERVAL=${3:-5}

# URL based on environment
case $ENVIRONMENT in
    staging)
        HEALTH_URL="https://staging.vie-platform.com/health"
        API_URL="https://staging.vie-platform.com/api/companies"
        ;;
    production)
        HEALTH_URL="https://vie-platform.com/health"
        API_URL="https://vie-platform.com/api/companies"
        ;;
    local)
        HEALTH_URL="http://localhost:3000/health"
        API_URL="http://localhost:3000/api/companies"
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Usage: $0 [staging|production|local]"
        exit 1
        ;;
esac

echo "🏥 Health check for $ENVIRONMENT environment"
echo "URL: $HEALTH_URL"
echo ""

START_TIME=$(date +%s)

# Check service health
check_health() {
    local response=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" 2>&1 || echo "000")
    local status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "200" ]; then
        echo "✅ Backend is healthy (HTTP $status)"
        return 0
    else
        echo "⏳ Backend returning HTTP $status"
        return 1
    fi
}

# Check API functionality
check_api() {
    local response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer test" "$API_URL" 2>&1 || echo "000")
    local status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "200" ] || [ "$status" = "401" ]; then
        echo "✅ API is responsive (HTTP $status)"
        return 0
    else
        echo "⏳ API returning HTTP $status"
        return 1
    fi
}

# Polling loop
HEALTH_OK=false
API_OK=false
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    ELAPSED=$(($(date +%s) - START_TIME))
    
    if ! $HEALTH_OK; then
        if check_health; then
            HEALTH_OK=true
        fi
    fi
    
    if ! $API_OK; then
        if check_api; then
            API_OK=true
        fi
    fi
    
    if $HEALTH_OK && $API_OK; then
        echo ""
        echo "✅ All checks passed!"
        echo "Total time: ${ELAPSED}s"
        exit 0
    fi
    
    echo "⏳ Waiting... (${ELAPSED}s/$TIMEOUT s)"
    sleep $INTERVAL
done

echo ""
echo "❌ Health check failed after $TIMEOUT seconds"
if ! $HEALTH_OK; then
    echo "  - Backend health check: FAILED"
fi
if ! $API_OK; then
    echo "  - API check: FAILED"
fi
exit 1
