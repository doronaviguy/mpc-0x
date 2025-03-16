"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const chains_1 = require("../config/chains");
const blockchain_service_1 = require("./blockchain.service");
const ethers_1 = require("ethers");
class AddressService {
    // Remove sensitive information from chain data
    sanitizeChainData(chainData) {
        // Create a sanitized copy of the chain info, removing sensitive fields
        const sanitizedChain = {
            id: chainData.chain.id,
            name: chainData.chain.name,
            priority: chainData.chain.priority,
            rpcUrl: '', // Remove actual RPC URL
            scanApiUrl: '', // Remove actual scan API URL
            scanApiKey: '' // Remove actual API key
        };
        // Return sanitized data
        return Object.assign(Object.assign({}, chainData), { chain: sanitizedChain });
    }
    fetchAddressData(address) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate address format
            if (!ethers_1.ethers.isAddress(address)) {
                throw new Error('Invalid Ethereum address format');
            }
            // Normalize the address to checksum format
            const checksumAddress = ethers_1.ethers.getAddress(address);
            // Get chains sorted by priority
            const chains = (0, chains_1.getSortedChains)();
            // Create blockchain service instances for each chain
            const services = chains.map(chain => new blockchain_service_1.BlockchainService(chain));
            // Fetch data from all chains in parallel
            const chainPromises = services.map(service => service.getAddressData(checksumAddress));
            const results = yield Promise.all(chainPromises);
            // Filter out null results, sanitize sensitive data, and sort by chain priority
            const validResults = results
                .filter(result => result !== null);
            // Sanitize each result to remove sensitive information
            const sanitizedResults = validResults.map(result => this.sanitizeChainData(result));
            // Create the response
            const response = {
                address: checksumAddress,
                data: sanitizedResults
            };
            return response;
        });
    }
}
exports.AddressService = AddressService;
