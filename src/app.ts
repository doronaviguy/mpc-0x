import { z } from "zod";
import { FastMCP } from "fastmcp";
import { AddressService } from "./services/address.service";
const addressService = new AddressService();

const server = new FastMCP({
  name: "Addition",
  version: "1.0.0",
});

server.addTool({
  name: "add",
  description: "Add two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async (args) => {
    return String(args.a + args.b);
  },
});

server.addTool({
  name: "check-balance",
  description: "Check the ETH balance of an Ethereum address",
  parameters: z.object({
    address: z.string().describe('Ethereum address (0x format)'),
    chainId: z.number().describe('Chain ID')
  }),
  execute: async (args) => {
    const addressData = await addressService.fetchAddressData(args.address);
    return String(`${args.address} has ${addressData.data[0].nativeBalance} ETH`);
  },
});

server.addTool({
  name: "get-transactions",
  description: "Get the transactions of an Ethereum address",
  parameters: z.object({
    address: z.string().describe('Ethereum address (0x format)'),
    chainId: z.number().describe('Chain ID')
  }),
  execute: async (args) => {
    const transactions = await addressService.fetchAddressData(args.address);
    return String(JSON.stringify(transactions.data[0].transactions) );
  },
});

server.addTool({
  name: "get-contract-code",
  description: "Get the code of a contract on the Ethereum blockchain",
  parameters: z.object({
    contractAddress: z.string().describe('Contract address'),
    chainId: z.number().describe('Chain ID')
  }),
  execute: async (args) => {
    
    return String("no code");
  },
});




server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: 8080,
  },
});
