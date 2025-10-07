#!/bin/bash

# Script to create/reset official website accounts for BlogMasterMind
# Usage: ./scripts/create-test-users.sh [--reset]

echo "Creating official website accounts for BlogMasterMind..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please run this script from the project root."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ "$method" = "POST" ]; then
        curl -s -X POST "http://localhost:8000$endpoint" \
             -H "Content-Type: application/json" \
             -d "$data" | jq .
    else
        curl -s "http://localhost:8000$endpoint" | jq .
    fi
}

echo "Checking server health..."
health=$(make_request "GET" "/api/health")
if [ $? -ne 0 ]; then
    echo "Error: Server is not running. Please start the server first with 'npm run dev'"
    exit 1
fi

# Reset option
if [ "$1" = "--reset" ]; then
    echo "Resetting all users..."
    reset_data="{
        \"username\": \"${TEST_ADMIN_USERNAME:-testcraftworld}\",
        \"password\": \"${TEST_ADMIN_PASSWORD:-admin123}\",
        \"email\": \"${TEST_ADMIN_EMAIL:-blogs_admin@testcraft.in}\",
        \"reset\": true
    }"
    reset_result=$(make_request "POST" "/api/admin/create-admin" "$reset_data")
    echo "Reset result: $reset_result"
fi

echo "Official website accounts are automatically created on server startup."
echo ""
echo "Official Website Accounts:"
echo "=========================="
echo "Admin Account (Full Access):"
echo "  Username: ${TEST_ADMIN_USERNAME:-testcraftworld}"
echo "  Password: ${TEST_ADMIN_PASSWORD:-admin123}"
echo "  Email: ${TEST_ADMIN_EMAIL:-blogs_admin@testcraft.in}"
echo ""
echo "Author Account (Content Creation):"
echo "  Username: ${TEST_AUTHOR_USERNAME:-author}"
echo "  Password: ${TEST_AUTHOR_PASSWORD:-author123}"
echo "  Email: ${TEST_AUTHOR_EMAIL:-testcraftworld@testcraft.in}"
echo ""
echo "Legacy Admin Account:"
echo "  Username: admin"
echo "  Password: ${ADMIN_TOKEN:-admin}"
echo "  Email: admin@testcraft.com"
echo ""
echo "You can now login at:"
echo "  Admin: http://localhost:8000/admin/login"
echo "  User: http://localhost:8000/login"
echo ""
echo "Note: These accounts are automatically created when the server starts."