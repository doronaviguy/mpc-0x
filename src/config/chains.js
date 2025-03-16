"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSortedChains = exports.chains = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
// SECURITY NOTE: Be careful not to expose API keys and RPC URLs in API responses
// Use the sanitizeChainData function in the AddressService to remove sensitive data
dotenv_1.default.config();
exports.chains = [
    {
        id: 1,
        name: 'Ethereum',
        rpcUrl: process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com',
        scanApiUrl: 'https://api.etherscan.io/api',
        scanApiKey: process.env.ETHERSCAN_API_KEY || '',
        priority: 1
    },
    {
        id: 56,
        name: 'Binance Smart Chain',
        rpcUrl: process.env.BSC_RPC_URL || 'https://binance.publicnode.com',
        scanApiUrl: 'https://api.bscscan.com/api',
        scanApiKey: process.env.BSCSCAN_API_KEY || '',
        priority: 2
    },
    {
        id: 137,
        name: 'Polygon',
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.public.blastapi.io',
        scanApiUrl: 'https://api.polygonscan.com/api',
        scanApiKey: process.env.POLYGONSCAN_API_KEY || '',
        priority: 3
    },
    {
        id: 43114,
        name: 'Avalanche',
        rpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
        scanApiUrl: 'https://api.snowtrace.io/api',
        scanApiKey: process.env.SNOWTRACE_API_KEY || '',
        priority: 4
    },
    {
        id: 42161,
        name: 'Arbitrum',
        rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
        scanApiUrl: 'https://api.arbiscan.io/api',
        scanApiKey: process.env.ARBISCAN_API_KEY || '',
        priority: 5
    },
    {
        id: 10,
        name: 'Optimism',
        rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
        scanApiUrl: 'https://api-optimistic.etherscan.io/api',
        scanApiKey: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || '',
        priority: 6
    }
];
// Helper to get sorted chains by priority
const getSortedChains = () => {
    return [...exports.chains].sort((a, b) => a.priority - b.priority);
};
exports.getSortedChains = getSortedChains;
