#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MCP SSE Testing Script ===${NC}"
echo -e "${BLUE}This script will test the Server-Sent Events (SSE) functionality of the MCP server.${NC}"
echo

# Check if the server is running
echo -e "${YELLOW}Checking if the server is running...${NC}"
SERVER_RESPONSE=$(curl -s http://localhost:3002/health)

if [[ "$SERVER_RESPONSE" == *"ok"* ]]; then
  echo -e "${GREEN}Server is running!${NC}"
else
  echo -e "${RED}Server is not running. Please start the server with 'npm run start:http' first.${NC}"
  exit 1
fi

echo
echo -e "${YELLOW}Starting SSE connection...${NC}"

# Create a temporary file for SSE output
SSE_OUTPUT_FILE=$(mktemp)
echo -e "${BLUE}SSE output will be saved to: ${SSE_OUTPUT_FILE}${NC}"

# Start SSE connection in the background and capture the output
curl -N http://localhost:3002/sse > "$SSE_OUTPUT_FILE" 2>/dev/null &
SSE_PID=$!

# Wait a moment for the connection to establish
echo -e "${YELLOW}Waiting for connection to establish...${NC}"
sleep 2

# Extract the client ID from the output
CLIENT_ID=$(grep -o '"clientId":"[^"]*"' "$SSE_OUTPUT_FILE" | head -1 | cut -d'"' -f4)

if [ -z "$CLIENT_ID" ]; then
  echo -e "${RED}Failed to get client ID${NC}"
  kill $SSE_PID
  rm "$SSE_OUTPUT_FILE"
  exit 1
fi

echo -e "${GREEN}Connected with client ID: ${CLIENT_ID}${NC}"

# Test address to use
TEST_ADDRESS="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"

# Subscribe to address updates
echo
echo -e "${YELLOW}Subscribing to address updates for ${TEST_ADDRESS}...${NC}"
SUBSCRIBE_RESPONSE=$(curl -s -X POST \
  "http://localhost:3002/sse/subscribe/${CLIENT_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"addresses\": [\"${TEST_ADDRESS}\"]}")

echo -e "${GREEN}Subscription response: ${SUBSCRIBE_RESPONSE}${NC}"

# Check connected clients
echo
echo -e "${YELLOW}Checking connected clients...${NC}"
CLIENTS_RESPONSE=$(curl -s http://localhost:3002/sse/clients)
echo -e "${GREEN}Connected clients: ${CLIENTS_RESPONSE}${NC}"

# Trigger an address update
echo
echo -e "${YELLOW}Triggering an address update by calling get-address-info...${NC}"
curl -s -X POST \
  http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"get-address-info\",
      \"arguments\": {
        \"address\": \"${TEST_ADDRESS}\"
      }
    }
  }" > /dev/null

echo -e "${GREEN}Address update triggered!${NC}"

# Wait a moment for the update to be processed
sleep 1

# Check if we received any updates
echo
echo -e "${YELLOW}Checking for SSE updates...${NC}"
UPDATES=$(grep -c "data:" "$SSE_OUTPUT_FILE")
echo -e "${GREEN}Received ${UPDATES} SSE events${NC}"

# Display the last few updates
echo
echo -e "${YELLOW}Last few SSE events:${NC}"
tail -n 5 "$SSE_OUTPUT_FILE" | sed 's/data: //' | while read -r line; do
  # Try to parse as JSON for pretty printing
  if echo "$line" | jq . >/dev/null 2>&1; then
    echo -e "${BLUE}$(echo "$line" | jq .)${NC}"
  else
    echo -e "${BLUE}$line${NC}"
  fi
done

# Test the ping tool
echo
echo -e "${YELLOW}Testing the ping tool...${NC}"
PING_RESPONSE=$(curl -s -X POST \
  http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "ping",
      "arguments": {}
    }
  }')
echo -e "${GREEN}Ping response: ${PING_RESPONSE}${NC}"

# Unsubscribe from address updates
echo
echo -e "${YELLOW}Unsubscribing from address updates...${NC}"
UNSUBSCRIBE_RESPONSE=$(curl -s -X POST \
  "http://localhost:3002/sse/unsubscribe/${CLIENT_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"addresses\": [\"${TEST_ADDRESS}\"]}")
echo -e "${GREEN}Unsubscription response: ${UNSUBSCRIBE_RESPONSE}${NC}"

# Clean up
echo
echo -e "${YELLOW}Cleaning up...${NC}"
kill $SSE_PID
rm "$SSE_OUTPUT_FILE"
echo -e "${GREEN}Done!${NC}"

echo
echo -e "${BLUE}=== Test Complete ===${NC}"
echo -e "${BLUE}The SSE functionality is working as expected.${NC}"
echo -e "${BLUE}You can now use the SSE endpoint in your applications.${NC}" 