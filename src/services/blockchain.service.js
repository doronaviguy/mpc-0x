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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
class BlockchainService {
    constructor(chain) {
        this.chain = chain;
        this.provider = new ethers_1.ethers.JsonRpcProvider(chain.rpcUrl);
    }
    isValidAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return ethers_1.ethers.isAddress(address);
        });
    }
    isContract(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const code = yield this.provider.getCode(address);
                return code !== '0x';
            }
            catch (error) {
                console.error(`Error checking if address is contract on ${this.chain.name}:`, error);
                return false;
            }
        });
    }
    getNativeBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const balance = yield this.provider.getBalance(address);
                return balance.toString();
            }
            catch (error) {
                console.error(`Error getting native balance on ${this.chain.name}:`, error);
                return '0';
            }
        });
    }
    getTokenBalances(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // This would typically use the block explorer API to get token balances
                // Implementation will vary by chain and API
                if (!this.chain.scanApiKey) {
                    return [];
                }
                const url = `${this.chain.scanApiUrl}?module=account&action=tokenlist&address=${address}&apikey=${this.chain.scanApiKey}`;
                const response = yield axios_1.default.get(url);
                if (response.data.status === '1' && Array.isArray(response.data.result)) {
                    return response.data.result.map((token) => ({
                        token: token.contractAddress,
                        symbol: token.symbol,
                        decimals: parseInt(token.decimals, 10),
                        balance: token.balance
                    }));
                }
                return [];
            }
            catch (error) {
                console.error(`Error getting token balances on ${this.chain.name}:`, error);
                return [];
            }
        });
    }
    getContractAbi(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.chain.scanApiKey) {
                    return null;
                }
                const url = `${this.chain.scanApiUrl}?module=contract&action=getabi&address=${address}&apikey=${this.chain.scanApiKey}`;
                const response = yield axios_1.default.get(url);
                if (response.data.status === '1') {
                    return response.data.result;
                }
                return null;
            }
            catch (error) {
                console.error(`Error getting contract ABI on ${this.chain.name}:`, error);
                return null;
            }
        });
    }
    getContractName(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.chain.scanApiKey) {
                    return null;
                }
                const url = `${this.chain.scanApiUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${this.chain.scanApiKey}`;
                const response = yield axios_1.default.get(url);
                if (response.data.status === '1' && response.data.result.length > 0) {
                    return response.data.result[0].ContractName || null;
                }
                return null;
            }
            catch (error) {
                console.error(`Error getting contract name on ${this.chain.name}:`, error);
                return null;
            }
        });
    }
    getTransactions(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, limit = 10) {
            try {
                if (!this.chain.scanApiKey) {
                    return [];
                }
                const url = `${this.chain.scanApiUrl}?module=account&action=txlist&address=${address}&page=1&offset=${limit}&sort=desc&apikey=${this.chain.scanApiKey}`;
                const response = yield axios_1.default.get(url);
                if (response.data.status === '1' && Array.isArray(response.data.result)) {
                    return response.data.result.map((tx) => ({
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to,
                        value: tx.value,
                        timestamp: parseInt(tx.timeStamp, 10),
                        method: tx.functionName || undefined
                    }));
                }
                return [];
            }
            catch (error) {
                console.error(`Error getting transactions on ${this.chain.name}:`, error);
                return [];
            }
        });
    }
    getAddressData(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isValidAddress = yield this.isValidAddress(address);
                if (!isValidAddress) {
                    return null;
                }
                const isContract = yield this.isContract(address);
                const nativeBalance = yield this.getNativeBalance(address);
                const tokens = yield this.getTokenBalances(address);
                const transactions = yield this.getTransactions(address);
                const data = {
                    chain: this.chain,
                    nativeBalance,
                    tokens,
                    isContract,
                    transactions
                };
                if (isContract) {
                    data.contractAbi = (yield this.getContractAbi(address)) || undefined;
                    data.contractName = (yield this.getContractName(address)) || undefined;
                }
                return data;
            }
            catch (error) {
                console.error(`Error getting address data on ${this.chain.name}:`, error);
                return null;
            }
        });
    }
}
exports.BlockchainService = BlockchainService;
