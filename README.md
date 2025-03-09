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

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful request
- 400: Invalid address format
- 500: Server error

## License

MIT