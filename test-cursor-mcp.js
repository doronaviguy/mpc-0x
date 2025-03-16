// Test script for the Cursor MCP server

const { spawn } = require('child_process');
const path = require('path');

// Sample Ethereum address to test with
const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik's address

// Start the MCP server process
const serverProcess = spawn('ts-node', ['src/cursor-mcp-server.ts'], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

// Function to send a request to the MCP server
function sendRequest(request) {
  return new Promise((resolve, reject) => {
    // Convert request to JSON string
    const requestStr = JSON.stringify(request);
    
    // Write the request to the server's stdin
    serverProcess.stdin.write(requestStr + '\n');
    
    // Set up a listener for the response
    const onData = (data) => {
      try {
        // Parse the response
        const response = JSON.parse(data.toString());
        
        // Remove the listener to avoid processing further data
        serverProcess.stdout.removeListener('data', onData);
        
        // Resolve with the response
        resolve(response);
      } catch (error) {
        console.error('Error parsing response:', error);
        reject(error);
      }
    };
    
    // Add the listener
    serverProcess.stdout.on('data', onData);
  });
}

// Test the get-address-info tool
async function testGetAddressInfo() {
  console.log(`Testing get-address-info with address: ${testAddress}`);
  
  const request = {
    jsonrpc: '2.0',
    id: '1',
    method: 'get-address-info',
    params: {
      address: testAddress
    }
  };
  
  try {
    const response = await sendRequest(request);
    console.log('Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Kill the server process
    serverProcess.kill();
  }
}

// Test the ping tool
async function testPing() {
  console.log('Testing ping tool');
  
  const request = {
    jsonrpc: '2.0',
    id: '1',
    method: 'ping',
    params: {}
  };
  
  try {
    const response = await sendRequest(request);
    console.log('Response:', JSON.stringify(response, null, 2));
    
    // After successful ping, test the get-address-info tool
    await testGetAddressInfo();
  } catch (error) {
    console.error('Error:', error);
    serverProcess.kill();
  }
}

// Start testing
testPing(); 