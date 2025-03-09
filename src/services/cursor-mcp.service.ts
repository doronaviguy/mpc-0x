import { AddressService } from './address.service';
import { AddressResponse } from '../types';

export interface CursorMCPRequest {
  address?: string;
  context_id?: string;
  operation?: string;
}

export interface CursorMCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  context_id?: string;
}

export class CursorMCPService {
  private addressService: AddressService;

  constructor() {
    this.addressService = new AddressService();
  }

  /**
   * Process a Cursor MCP request
   * @param request The Cursor MCP request object
   * @returns A formatted Cursor MCP response
   */
  async processRequest(request: CursorMCPRequest): Promise<CursorMCPResponse> {
    try {
      // Validate the request
      if (!request.operation) {
        return {
          success: false,
          error: 'Missing operation parameter',
          context_id: request.context_id
        };
      }

      // Handle different operations
      switch (request.operation) {
        case 'getAddressData':
          return await this.handleGetAddressData(request);
        case 'ping':
          return {
            success: true,
            data: { status: 'ok', timestamp: Date.now() },
            context_id: request.context_id
          };
        default:
          return {
            success: false,
            error: `Unsupported operation: ${request.operation}`,
            context_id: request.context_id
          };
      }
    } catch (error) {
      console.error('Error processing MCP request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        context_id: request.context_id
      };
    }
  }

  /**
   * Handle the getAddressData operation
   * @param request The Cursor MCP request
   * @returns A formatted Cursor MCP response with address data
   */
  private async handleGetAddressData(request: CursorMCPRequest): Promise<CursorMCPResponse> {
    if (!request.address) {
      return {
        success: false,
        error: 'Missing address parameter',
        context_id: request.context_id
      };
    }

    try {
      const addressData: AddressResponse = await this.addressService.fetchAddressData(request.address);
      
      return {
        success: true,
        data: addressData,
        context_id: request.context_id
      };
    } catch (error) {
      console.error('Error fetching address data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching address data',
        context_id: request.context_id
      };
    }
  }
}