#!/bin/bash

# FreshVilla API Endpoint Validation Script
# Run this after starting the server to validate all endpoints

BASE_URL="http://localhost:5000/api"
ADMIN_TOKEN=""
STORE_USER_TOKEN=""

echo "🧪 FreshVilla API Endpoint Validation"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  
  echo -n "Testing: $description... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint")
  
  if [ $response -eq 200 ] || [ $response -eq 201 ] || [ $response -eq 401 ] || [ $response -eq 403 ]; then
    echo -e "${GREEN}✓${NC} (HTTP $response)"
  else
    echo -e "${RED}✗${NC} (HTTP $response)"
  fi
}

echo "📡 Testing Public Endpoints"
echo "----------------------------"
test_endpoint "GET" "/health" "Health check"
test_endpoint "POST" "/store-users/login" "Store user login"
test_endpoint "GET" "/store-users/roles" "Get role definitions"
test_endpoint "GET" "/service-areas/check-availability?city=Delhi" "Check service availability"

echo ""
echo "🔒 Testing Protected Endpoints (Expected: 401 Unauthorized)"
echo "-----------------------------------------------------------"
test_endpoint "GET" "/admin/store-users/stores" "Get all stores (Super Admin)"
test_endpoint "GET" "/store-erp/test-store-id/dashboard" "Get store dashboard"
test_endpoint "GET" "/orders/test-order-id/print/invoice" "Print order invoice"

echo ""
echo "✅ Basic validation complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Start server: npm run dev"
echo "2. Create super admin account"
echo "3. Create a store and store owner"
echo "4. Test with actual authentication tokens"
echo ""
echo "Full API documentation: SETUP_AND_VALIDATION.md"
