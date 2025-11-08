#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = parseInt(process.env.PORT || '5500', 10);

console.log('🛑 Stopping ACUL Tester...\n');

// Step 1: Stop the server
try {
  console.log(`� Stopping server on port ${PORT}...`);
  execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null`, { stdio: 'inherit' });
  console.log('  ✓ Server stopped\n');
} catch (error) {
  console.log(`  ℹ️  No server running on port ${PORT}\n`);
}

// Step 2: Cleanup Auth0 ACUL settings
try {
  console.log('🧹 Cleaning up Auth0 ACUL settings...\n');
  execSync('node scripts/cleanup-auth0.js', { 
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
} catch (error) {
  console.error('\n⚠️  Auth0 cleanup failed - you may need to reset screens manually');
  process.exit(1);
}

console.log('\n✅ All cleanup complete!');
