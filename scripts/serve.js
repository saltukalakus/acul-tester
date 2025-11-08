#!/usr/bin/env node

import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5500', 10);
const DIST_DIR = join(__dirname, '..', 'dist');

if (!existsSync(DIST_DIR)) {
  console.error('❌ No dist directory found. Run "npm run build" first.');
  process.exit(1);
}

// Enable CORS for Auth0 usage (MUST be before static middleware)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Serve static files
app.use(express.static(DIST_DIR));

// Start server
app.listen(PORT, async () => {
  console.log('\n🚀 Auth0 ACUL Sample Server Running!\n');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log('\n📦 Available Samples:');
  
  // Read manifest to show available samples
  try {
    const manifestPath = join(DIST_DIR, 'manifest.json');
    if (existsSync(manifestPath)) {
      const fs = await import('fs');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      manifest.samples.forEach(sample => {
        console.log(`   • ${sample.name.padEnd(30)} http://localhost:${PORT}${sample.html}`);
      });
    }
  } catch (error) {
    console.error('Could not read manifest');
  }
  
  console.log('\n✨ Each sample has standalone HTML, CSS, and JS files');
  console.log('💡 Use these URLs in Auth0 Dashboard for local testing');
  console.log('\n⌨️  Press Ctrl+C to stop\n');
});
