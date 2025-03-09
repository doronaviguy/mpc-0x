import { getSortedChains } from '../config/chains';
import { BlockchainService } from './blockchain.service';
import { AddressResponse, AddressData, Chain } from '../types';
import { ethers } from 'ethers';

export class AddressService {
  // Remove sensitive information from chain data
  private sanitizeChainData(chainData: AddressData): AddressData {
    // Create a sanitized copy of the chain info, removing sensitive fields
    const sanitizedChain: Chain = {
      id: chainData.chain.id,
      name: chainData.chain.name,
      priority: chainData.chain.priority,
      rpcUrl: '', // Remove actual RPC URL
      scanApiUrl: '', // Remove actual scan API URL
      scanApiKey: '' // Remove actual API key
    };

    // Return sanitized data
    return {
      ...chainData,
      chain: sanitizedChain
    };
  }

  async fetchAddressData(address: string): Promise<AddressResponse> {
    // Validate address format
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }

    // Normalize the address to checksum format
    const checksumAddress = ethers.getAddress(address);
    
    // Get chains sorted by priority
    const chains = getSortedChains();
    
    // Create blockchain service instances for each chain
    const services = chains.map(chain => new BlockchainService(chain));
    
    // Fetch data from all chains in parallel
    const chainPromises = services.map(service => service.getAddressData(checksumAddress));
    const results = await Promise.all(chainPromises);
    
    // Filter out null results, sanitize sensitive data, and sort by chain priority
    const validResults = results
      .filter(result => result !== null) as AddressData[];
    
    // Sanitize each result to remove sensitive information
    const sanitizedResults = validResults.map(result => this.sanitizeChainData(result));
    
    // Create the response
    const response: AddressResponse = {
      address: checksumAddress,
      data: sanitizedResults
    };
    
    return response;
  }
}