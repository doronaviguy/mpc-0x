import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AddressService } from './services/address.service';

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

// Start server
app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(`- GET /health - Server health check`);
  console.log(`- GET /api/address/:address - Fetch data for an EVM address`);
});