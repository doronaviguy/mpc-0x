const axios = require('axios');

// Test address - Ethereum null address (for testing only)
const testAddress = '0x0000000000000000000000000000000000000000';

// Base URL - change this to your server URL
const baseURL = 'http://localhost:3001';

// Test ping operation
async function testPing() {
  try {
    console.log('Testing MCP ping operation...');
    const response = await axios.post(`${baseURL}/api/mcp`, {
      operation: 'ping',
      context_id: 'test-ping-123'
    });
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.success;
  } catch (error) {
    console.error('Error testing ping operation:', error.message);
    return false;
  }
}

// Test getAddressData operation
async function testGetAddressData() {
  try {
    console.log(`Testing MCP getAddressData operation for address ${testAddress}...`);
    const response = await axios.post(`${baseURL}/api/mcp`, {
      operation: 'getAddressData',
      address: testAddress,
      context_id: 'test-address-123'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data preview:', JSON.stringify({
      success: response.data.success,
      address: response.data.data?.address,
      chains: response.data.data?.data?.length || 0,
      context_id: response.data.context_id
    }, null, 2));
    
    return response.data.success;
  } catch (error) {
    console.error('Error testing getAddressData operation:', error.message);
    return false;
  }
}

// Test invalid operation
async function testInvalidOperation() {
  try {
    console.log('Testing MCP with invalid operation...');
    const response = await axios.post(`${baseURL}/api/mcp`, {
      operation: 'invalidOperation',
      context_id: 'test-invalid-123'
    });
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return !response.data.success; // Should be false for invalid operations
  } catch (error) {
    console.log('Expected error for invalid operation:', error.message);
    return true; // Error is expected for invalid operations
  }
}

// Run all tests
async function runTests() {
  console.log('=== CURSOR MCP COMPATIBILITY TESTS ===\n');
  
  const pingResult = await testPing();
  console.log(`Ping test ${pingResult ? 'PASSED' : 'FAILED'}\n`);
  
  const addressResult = await testGetAddressData();
  console.log(`GetAddressData test ${addressResult ? 'PASSED' : 'FAILED'}\n`);
  
  const invalidResult = await testInvalidOperation();
  console.log(`Invalid operation test ${invalidResult ? 'PASSED' : 'FAILED'}\n`);
  
  console.log('=== TEST SUMMARY ===');
  console.log(`Passed: ${[pingResult, addressResult, invalidResult].filter(Boolean).length}/3 tests`);
}

// Run the tests
runTests();