const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

// 1. DETECT OS
const isWin = os.platform() === 'win32';

// 2. RESOLVE PLUGIN PATH
const pluginBinary = isWin ? 'protoc-gen-ts_proto.cmd' : 'protoc-gen-ts_proto';
const pluginPath = path.resolve(__dirname, '../../../node_modules/.bin', pluginBinary);

// 3. CONSTRUCT COMMAND
// FIX: Added --proto_path=./src and changed input file to just "game.proto"
const command = `protoc --plugin=protoc-gen-ts_proto="${pluginPath}" --proto_path=./src --ts_proto_out=./src game.proto --ts_proto_opt=esModuleInterop=true,outputEncodeMethods=true,outputJsonMethods=false,outputClientImpl=false`;

console.log(`[Gillian] Running: ${command}`);

try {
  // 4. EXECUTE
  execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch (error) {
  console.error('[Gillian] Protoc generation failed.');
  process.exit(1);
}
