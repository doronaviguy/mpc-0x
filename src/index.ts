import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AddressService } from './services/address.service';
import { CursorMCPService, CursorMCPRequest } from './services/cursor-mcp.service';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create services
const addressService = new AddressService();
const cursorMCPService = new CursorMCPService();

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Define address route function
const getAddressData = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const data = await addressService.fetchAddressData(address);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching address data:', error);
    
    if (error instanceof Error && error.message === 'Invalid Ethereum address format') {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle address request
app.get('/api/address/:address', getAddressData);

// Define cursor MCP route handler
const handleMCPRequest = async (req, res) => {
  try {
    const mcpRequest: CursorMCPRequest = req.body;
    const response = await cursorMCPService.processRequest(mcpRequest);
    
    // Set appropriate status code based on success
    const statusCode = response.success ? 200 : 400;
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error('Error processing MCP request:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      context_id: req.body.context_id
    });
  }
};

// Cursor MCP endpoint
app.post('/api/mcp', handleMCPRequest);

// Cursor MCP compatibility route (alternate syntax)
app.post('/mcp', (req, res) => {
  return res.redirect(307, '/api/mcp');
});

// Start server
app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(`- GET /health - Server health check`);
  console.log(`- GET /api/address/:address - Fetch data for an EVM address`);
  console.log(`- POST /api/mcp - Cursor MCP compatible endpoint`);
  console.log(`- POST /mcp - Alternative Cursor MCP endpoint`);
});