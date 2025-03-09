import { ethers } from 'ethers';
import axios from 'axios';
import { Chain, AddressData, TokenBalance, Transaction } from '../types';

export class BlockchainService {
  private chain: Chain;
  private provider: ethers.JsonRpcProvider;

  constructor(chain: Chain) {
    this.chain = chain;
    this.provider = new ethers.JsonRpcProvider(chain.rpcUrl);
  }

  async isValidAddress(address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }

  async isContract(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error(`Error checking if address is contract on ${this.chain.name}:`, error);
      return false;
    }
  }

  async getNativeBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      console.error(`Error getting native balance on ${this.chain.name}:`, error);
      return '0';
    }
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      // This would typically use the block explorer API to get token balances
      // Implementation will vary by chain and API
      if (!this.chain.scanApiKey) {
        return [];
      }

      const url = `${this.chain.scanApiUrl}?module=account&action=tokenlist&address=${address}&apikey=${this.chain.scanApiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        return response.data.result.map((token: any) => ({
          token: token.contractAddress,
          symbol: token.symbol,
          decimals: parseInt(token.decimals, 10),
          balance: token.balance
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error getting token balances on ${this.chain.name}:`, error);
      return [];
    }
  }

  async getContractAbi(address: string): Promise<string | null> {
    try {
      if (!this.chain.scanApiKey) {
        return null;
      }

      const url = `${this.chain.scanApiUrl}?module=contract&action=getabi&address=${address}&apikey=${this.chain.scanApiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === '1') {
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting contract ABI on ${this.chain.name}:`, error);
      return null;
    }
  }

  async getContractName(address: string): Promise<string | null> {
    try {
      if (!this.chain.scanApiKey) {
        return null;
      }

      const url = `${this.chain.scanApiUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${this.chain.scanApiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === '1' && response.data.result.length > 0) {
        return response.data.result[0].ContractName || null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting contract name on ${this.chain.name}:`, error);
      return null;
    }
  }

  async getTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
    try {
      if (!this.chain.scanApiKey) {
        return [];
      }

      const url = `${this.chain.scanApiUrl}?module=account&action=txlist&address=${address}&page=1&offset=${limit}&sort=desc&apikey=${this.chain.scanApiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        return response.data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: parseInt(tx.timeStamp, 10),
          method: tx.functionName || undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error getting transactions on ${this.chain.name}:`, error);
      return [];
    }
  }

  async getAddressData(address: string): Promise<AddressData | null> {
    try {
      const isValidAddress = await this.isValidAddress(address);
      if (!isValidAddress) {
        return null;
      }

      const isContract = await this.isContract(address);
      const nativeBalance = await this.getNativeBalance(address);
      const tokens = await this.getTokenBalances(address);
      const transactions = await this.getTransactions(address);
      
      const data: AddressData = {
        chain: this.chain,
        nativeBalance,
        tokens,
        isContract,
        transactions
      };

      if (isContract) {
        data.contractAbi = await this.getContractAbi(address) || undefined;
        data.contractName = await this.getContractName(address) || undefined;
      }

      return data;
    } catch (error) {
      console.error(`Error getting address data on ${this.chain.name}:`, error);
      return null;
    }
  }
}