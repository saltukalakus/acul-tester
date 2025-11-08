#!/usr/bin/env node

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5500', 10);

try {
  console.log(`🛑 Stopping server on port ${PORT}...`);
  execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null`, { stdio: 'inherit' });
  console.log('✅ Server stopped');
} catch (error) {
  console.log('ℹ️  No server running on port', PORT);
}
