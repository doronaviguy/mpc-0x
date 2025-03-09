const { spawn } = require('child_process');
const readline = require('readline');

// Test address - Vitalik's address
const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

// Start the MCP server process
console.log('Starting MCP server...');
const mcpProcess = spawn('ts-node', ['src/cursor-mcp-server.ts'], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Create interface to read/write to the MCP server
const rl = readline.createInterface({
  input: mcpProcess.stdout,
  output: mcpProcess.stdin,
  terminal: false
});

// Track initialization status
let initialized = false;

// Handle server output
rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    console.log('\nReceived message from server:');
    console.log(JSON.stringify(message, null, 2));
    
    // Check if this is the initialization response
    if (message.id === 1 && message.result) {
      console.log('\nServer initialized successfully!');
      initialized = true;
      
      // Send the tool request after initialization
      console.log('\nSending get-address-info request...');
      const toolRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get-address-info',
          arguments: {
            address: testAddress
          }
        }
      };
      mcpProcess.stdin.write(JSON.stringify(toolRequest) + '\n');
      pendingRequests[2] = toolRequest;
    }
    
    // Check if this is the tool response
    if (message.id === 2) {
      console.log('\nTool request completed successfully!');
      setTimeout(() => {
        mcpProcess.kill();
        process.exit(0);
      }, 1000);
    }
  } catch (error) {
    console.error('Error parsing server message:', error);
  }
});

// Track pending requests
const pendingRequests = {};

// Send initialization message
console.log('\nSending initialization message...');
const initMessage = {
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
};
mcpProcess.stdin.write(JSON.stringify(initMessage) + '\n');
pendingRequests[1] = initMessage;

// Handle process exit
process.on('SIGINT', () => {
  mcpProcess.kill();
  process.exit(0);
});

// Set timeout to kill the process if it hangs
setTimeout(() => {
  console.error('Test timed out after 15 seconds');
  mcpProcess.kill();
  process.exit(1);
}, 15000); 