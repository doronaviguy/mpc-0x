import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AddressService } from './services/address.service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create services
const addressService = new AddressService();

// Create server instance
const server = new McpServer({
  name: "ethereum-address-info",
  version: "1.0.0",
  description: "Cursor MCP server for fetching data based on EVM addresses across multiple chains",
});

// Format address data for display
function formatAddressData(data: any): string {
  if (!data || !data.data || !Array.isArray(data.data)) {
    return "No data available for this address";
  }

  const chains = data.data.map((chain: any) => {
    const chainInfo = [
      `Chain: ${chain.chain_name || chain.chain_id || "Unknown"}`,
      `Balance: ${chain.balance || "0"} ETH`,
    ];

    if (chain.is_contract) {
      chainInfo.push(`Contract: Yes`);
      if (chain.contract_code) {
        chainInfo.push(`Code Hash: ${chain.contract_code.substring(0, 20)}...`);
      }
    } else {
      chainInfo.push(`Contract: No`);
    }

    if (chain.transactions && chain.transactions.length > 0) {
      chainInfo.push(`Recent Transactions: ${chain.transactions.length}`);
      chain.transactions.slice(0, 3).forEach((tx: any, i: number) => {
        // Format transaction based on its type
        let txInfo;
        if (typeof tx === 'string') {
          txInfo = tx;
        } else if (tx && typeof tx === 'object') {
          // Handle transaction objects
          if (tx.hash) {
            txInfo = `${tx.hash.substring(0, 10)}... (${tx.method || 'transfer'})`;
          } else {
            txInfo = JSON.stringify(tx).substring(0, 30) + '...';
          }
        } else {
          txInfo = 'Unknown transaction';
        }
        chainInfo.push(`  ${i+1}. ${txInfo}`);
      });
    }

    return chainInfo.join("\n");
  });

  return [
    `Address: ${data.address}`,
    "---",
    chains.join("\n\n"),
  ].join("\n");
}

// Register address info tool
server.tool(
  "get-address-info",
  "Get information about an Ethereum address across multiple chains",
  {
    address: z.string().describe("Ethereum address to look up"),
  },
  async ({ address }) => {
    try {
      const addressData = await addressService.fetchAddressData(address);

      return {
        content: [
          {
            type: "text",
            text: formatAddressData(addressData),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching data for address ${address}: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  }
);

// Register ping tool for health checks
server.tool(
  "ping",
  "Check if the server is running",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `Server is running. Current time: ${new Date().toISOString()}`,
        },
      ],
    };
  }
);

// Start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ethereum Address MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 