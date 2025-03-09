const axios = require('axios');

// Test address - Vitalik's address
const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

// Base URL - change this to your server URL
const baseURL = 'http://localhost:3002';

async function testMCP() {
  try {
    console.log('Testing HTTP MCP server...');
    
    // Step 1: Initialize
    console.log('\nSending initialization request...');
    const initResponse = await axios.post(`${baseURL}/mcp`, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '0.1.0',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    });
    
    console.log('Initialization response:');
    console.log(JSON.stringify(initResponse.data, null, 2));
    
    // Step 2: List tools
    console.log('\nSending tools/list request...');
    const listResponse = await axios.post(`${baseURL}/mcp`, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });
    
    console.log('Tools list response:');
    console.log(JSON.stringify(listResponse.data, null, 2));
    
    // Step 3: Call get-address-info tool
    console.log('\nSending get-address-info request...');
    const toolResponse = await axios.post(`${baseURL}/mcp`, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'get-address-info',
        arguments: {
          address: testAddress
        }
      }
    });
    
    console.log('Tool response:');
    console.log(JSON.stringify(toolResponse.data, null, 2));
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing HTTP MCP server:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMCP(); 