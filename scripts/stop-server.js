#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = parseInt(process.env.PORT || '5500', 10);

console.log('🛑 Stopping ACUL Tester...\n');

// Stop the server
try {
  console.log(`🔌 Stopping server on port ${PORT}...`);
  execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null`, { stdio: 'inherit' });
  console.log('  ✓ Server stopped\n');
} catch (error) {
  console.log(`  ℹ️  No server running on port ${PORT}\n`);
}

console.log('✅ Server stopped!');
