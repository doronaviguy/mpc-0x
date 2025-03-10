# MCP 0x Address Server

A TypeScript server for fetching data about Ethereum Virtual Machine (EVM) addresses across multiple chains. The server prioritizes chains by popularity (Ethereum first, then BSC, etc.) and provides detailed information about addresses, including balance data, contract information, and transaction history.

## Features

- Address validation and checksumming
- Multi-chain support with priority ordering
- Native balance fetching for each chain
- Token balance fetching on all supported chains
- Contract detection and ABI fetching
- Transaction history retrieval
- Support for multiple EVM-compatible chains

## Supported Chains

1. Ethereum (ETH) - Highest priority
2. Binance Smart Chain (BSC)
3. Polygon (MATIC)
4. Avalanche (AVAX)
5. Arbitrum (ARB)
6. Optimism (OP)

## Cursor MCP Compatibility

This server implements the Cursor Model Context Protocol (MCP) which allows it to be used with Cursor applications. The MCP implementation provides:

1. Standardized request/response format with consistent structure
2. Context ID tracking for request tracing
3. Operation-based API for different actions
4. Consistent error handling
5. Both RESTful and MCP-compatible endpoints

## Using with Cursor as an MCP Server

This project can be used as a Model Context Protocol (MCP) server for Cursor. The MCP server provides tools for fetching information about Ethereum addresses directly within Cursor.

### Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your API keys
4. Build the project: `npm run build`

### Running the MCP Server

To run the MCP server for Cursor using stdio transport:

```bash
npm run mcp
```

This will start the MCP server using stdio transport, which is compatible with Cursor.

### Running the MCP Server over HTTP

To run the MCP server over HTTP (which allows you to connect to it from Cursor using a URL):

```bash
npm run http-mcp
```

This will start the MCP server on port 3002 (or the port specified in your .env file as MCP_PORT).

### Testing the MCP Server

You can test the stdio MCP server without Cursor using the provided test script:

```bash
npm run test:cursor-mcp
```

You can test the HTTP MCP server using:

```bash
npm run test:http-mcp
```

These scripts:
1. Start the MCP server
2. Send an initialization message
3. Call the `get-address-info` tool with Vitalik's Ethereum address
4. Display the response

If everything is working correctly, you should see the address information in the console.

### Configuring Cursor to Use This MCP Server

#### Using Stdio Transport (Recommended)

1. Open Cursor settings
2. Navigate to the MCP section
3. Add a new MCP server with the following configuration:
   - Name: Ethereum Address Info
   - Command: `cd /path/to/mcp-0x-address && npm run mcp`
   - Enabled: Yes

#### Using HTTP Transport

1. Open Cursor settings
2. Navigate to the MCP section
3. Add a new MCP server with the following configuration:
   - Name: Ethereum Address Info
   - URL: `http://localhost:3002/mcp`
   - Enabled: Yes

Make sure the HTTP server is running before you try to use it in Cursor.

### Available Tools

The MCP server provides the following tools:

- **get-address-info**: Get information about an Ethereum address across multiple chains
  - Parameters: `address` (Ethereum address to look up)
  
- **ping**: Check if the server is running
  - Parameters: None

### Example Usage in Cursor

Once configured, you can use the MCP server in Cursor by typing commands like:

```
/get-address-info 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

This will fetch and display information about the specified Ethereum address.

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mcp-0x-address.git
cd mcp-0x-address
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Edit the `.env` file to add your:
   - RPC URLs for each chain
   - Block explorer API keys (Etherscan, BSCScan, etc.)
   - Server configuration

### Configuration

Create a `.env` file with the following structure:

```
# Chain RPC endpoints
ETH_RPC_URL=https://ethereum.publicnode.com
BSC_RPC_URL=https://binance.publicnode.com
POLYGON_RPC_URL=https://polygon-mainnet.public.blastapi.io
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io

# Block explorer API keys
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
ARBISCAN_API_KEY=your_arbiscan_api_key_here
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimism_etherscan_api_key_here

# Server configuration
PORT=3001
```

### Running the Server

```bash
# Development mode
npm run dev

# Build
npm run build

# Production mode
npm run start
```

## API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok"
}
```

### Get Address Data
```
GET /api/address/:address
```

Example request:
```
GET /api/address/0x1234567890123456789012345678901234567890
```

Example response:
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "data": [
    {
      "chain": {
        "id": 1,
        "name": "Ethereum",
        "priority": 1,
        "rpcUrl": "",
        "scanApiUrl": "",
        "scanApiKey": ""
      },
      "nativeBalance": "1000000000000000000",
      "tokens": [
        {
          "token": "0xabcdef1234567890abcdef1234567890abcdef12",
          "symbol": "TOKEN",
          "decimals": 18,
          "balance": "1000000000000000000"
        }
      ],
      "isContract": false,
      "transactions": [
        {
          "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          "from": "0x1234567890123456789012345678901234567890",
          "to": "0x0987654321098765432109876543210987654321",
          "value": "1000000000000000000",
          "timestamp": 1677750000,
          "method": "transfer(address,uint256)"
        }
      ]
    }
  ]
}
```

If the address is a contract, the response will include additional contract information:
```json
{
  "contractAbi": "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"}...]",
  "contractName": "ERC20Token"
}
```

### Cursor MCP Endpoint
```
POST /api/mcp
```

This endpoint is compatible with the Cursor Model Context Protocol (MCP). It accepts POST requests with a JSON body.

Example request:
```json
{
  "operation": "getAddressData",
  "address": "0x1234567890123456789012345678901234567890",
  "context_id": "request-123"
}
```

Example response:
```json
{
  "success": true,
  "data": {
    "address": "0x1234567890123456789012345678901234567890",
    "data": [
      {
        "chain": {
          "id": 1,
          "name": "Ethereum",
          "priority": 1,
          "rpcUrl": "",
          "scanApiUrl": "",
          "scanApiKey": ""
        },
        "nativeBalance": "1000000000000000000",
        "tokens": [
          {
            "token": "0xabcdef1234567890abcdef1234567890abcdef12",
            "symbol": "TOKEN",
            "decimals": 18,
            "balance": "1000000000000000000"
          }
        ],
        "isContract": false,
        "transactions": [
          {
            "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "from": "0x1234567890123456789012345678901234567890",
            "to": "0x0987654321098765432109876543210987654321",
            "value": "1000000000000000000",
            "timestamp": 1677750000,
            "method": "transfer(address,uint256)"
          }
        ]
      }
    ]
  },
  "context_id": "request-123"
}
```

#### Supported MCP Operations

1. `getAddressData`: Fetches information about an Ethereum address
   - Required parameters: `address`
   - Optional parameters: `context_id`

2. `ping`: Simple health check for the MCP endpoint
   - Optional parameters: `context_id`

For error cases, the response will have `success: false` and an `error` message:

```json
{
  "success": false,
  "error": "Invalid Ethereum address format",
  "context_id": "request-123"
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful request
- 400: Invalid address format
- 500: Server error

## License

MIT