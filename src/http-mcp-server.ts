import express = require('express');
import cors = require('cors');
import bodyParser = require('body-parser');
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AddressService } from './services/address.service';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.MCP_PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create services
const addressService = new AddressService();

// Create MCP server instance
const mcpServer = new McpServer({
  name: "ethereum-address-info",
  version: "1.0.0",
  description: "Cursor MCP server for fetching data based on EVM addresses across multiple chains",
});

// Store registered tools in an array we can access
interface Tool {
  name: string;
  description: string;
  parameters: any;
}

const registeredTools: Tool[] = [];

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
mcpServer.tool(
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

// Add to our registered tools
registeredTools.push({
  name: "get-address-info",
  description: "Get information about an Ethereum address across multiple chains",
  parameters: {
    address: z.string().describe("Ethereum address to look up"),
  }
});

// Register ping tool for health checks
mcpServer.tool(
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

// Add to our registered tools
registeredTools.push({
  name: "ping",
  description: "Check if the server is running",
  parameters: {}
});

// HTTP endpoint for MCP requests
app.post('/mcp', function(req, res) {
  try {
    // Handle initialization
    if (req.body.method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "ethereum-address-info",
            version: "1.0.0",
            description: "Cursor MCP server for fetching data based on EVM addresses across multiple chains"
          }
        }
      };
      return res.json(response);
    }
    
    // Handle tools/call
    if (req.body.method === 'tools/call') {
      const { name, arguments: args } = req.body.params;
      
      // Get the tool name
      const toolName = name;
      
      // Call the appropriate tool handler
      if (toolName === 'get-address-info') {
        addressService.fetchAddressData(args.address)
          .then(result => {
            return res.json({
              jsonrpc: '2.0',
              id: req.body.id,
              result: {
                content: [
                  {
                    type: "text",
                    text: formatAddressData(result),
                  },
                ],
              }
            });
          })
          .catch(error => {
            return res.json({
              jsonrpc: '2.0',
              id: req.body.id,
              error: {
                code: -32603,
                message: error instanceof Error ? error.message : 'Internal error'
              }
            });
          });
        return;
      } else if (toolName === 'ping') {
        return res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          result: {
            content: [
              {
                type: "text",
                text: `Server is running. Current time: ${new Date().toISOString()}`,
              },
            ],
          }
        });
      } else {
        return res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          error: {
            code: -32601,
            message: `Tool '${name}' not found`
          }
        });
      }
    }
    
    // Handle tools/list
    if (req.body.method === 'tools/list') {
      return res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          tools: registeredTools,
          pagination: {
            total: registeredTools.length,
            limit: registeredTools.length,
            offset: 0
          }
        }
      });
    }
    
    // Handle unknown methods
    return res.json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32601,
        message: `Method '${req.body.method}' not found`
      }
    });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: 'Internal server error'
      }
    });
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`HTTP MCP server listening on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(`- GET /health - Server health check`);
  console.log(`- POST /mcp - MCP endpoint`);
}); 