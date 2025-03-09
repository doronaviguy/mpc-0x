import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CursorMCPService, CursorMCPRequest } from './services/cursor-mcp.service';

const cursorMCPService = new CursorMCPService();


interface ContractInfo {
  properties: {
    address?: string;
    chainIds: Number[];
    balance?: string;
    isContract?: boolean;
    contractCode?: string;
    transactions?: string[];
  };
}

// Format alert data
function formatContractInfo(feature: ContractInfo): string {
  const props = feature.properties;
  return [
    `Address: ${props.address || "Unknown"}`,
    `Balance: ${props.balance || "Unknown"}`,
    `Chain Ids: ${props.chainIds?.join(", ") || "Unknown"}`,
    `Is Contract: ${props.isContract || "Unknown"}`,
    `Contract Code: ${props.contractCode || "Unknown"}`,
    `Transactions: ${props.transactions?.join(", ") || "Unknown"}`,
    "---",
  ].join("\n");
}



// Create server instance
const server = new McpServer({
  name: "contract-info",
  version: "1.0.0",
});

// Register weather tools
server.tool(
  "get-contract-info",
  "Get Contrant info balance and transactions and code",
  {
    address: z.string().describe("Ethereum address"),
  },
  async ({ address }) => {
    const contractAddress = address.toUpperCase();
    const response = await cursorMCPService.processRequest({
        address: contractAddress,
        operation: "get-contract-info",
    });
    

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve contract info",
          },
        ],
      };
    }

    const features = response.data || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No contract info for ${address}`,
          },
        ],
      };
    }

    const formattedContractInfo = features.map(formatContractInfo);
    const contractInfoText = `Contract info for ${address}:\n\n${formattedContractInfo.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: contractInfoText,
        },
      ],
    };
  },
);


// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Contract info MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});