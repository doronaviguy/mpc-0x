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
exports.CursorMCPService = void 0;
const address_service_1 = require("./address.service");
class CursorMCPService {
    constructor() {
        this.addressService = new address_service_1.AddressService();
    }
    /**
     * Process a Cursor MCP request
     * @param request The Cursor MCP request object
     * @returns A formatted Cursor MCP response
     */
    processRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    case 'get-contract-info':
                        if (!request.address || !request.context_id) {
                            return {
                                success: false,
                                error: 'Missing required parameters: address or context_id',
                                context_id: request.context_id
                            };
                        }
                        return yield this.handleGetAddressData({
                            address: request.address,
                            context_id: request.context_id
                        });
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
            }
            catch (error) {
                console.error('Error processing MCP request:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    context_id: request.context_id
                };
            }
        });
    }
    /**
     * Handle the getAddressData operation
     * @param request The Cursor MCP request
     * @returns A formatted Cursor MCP response with address data
     */
    handleGetAddressData(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!request.address) {
                return {
                    success: false,
                    error: 'Missing address parameter',
                    context_id: request.context_id
                };
            }
            try {
                const addressData = yield this.addressService.fetchAddressData(request.address);
                return {
                    success: true,
                    data: addressData,
                    context_id: request.context_id
                };
            }
            catch (error) {
                console.error('Error fetching address data:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error fetching address data',
                    context_id: request.context_id
                };
            }
        });
    }
}
exports.CursorMCPService = CursorMCPService;
