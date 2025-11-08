#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { 
  validateAuth0Config, 
  getManagementToken, 
  getAvailableScreens,
  bulkUpdateRendering
} from './auth0-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_DIR = join(__dirname, '..', 'dist');

// Read current version
const versionFile = join(DIST_DIR, '.current-version');
if (!existsSync(versionFile)) {
  console.error('❌ No build version found! Run "npm run build" first.');
  process.exit(1);
}
const CURRENT_VERSION = readFileSync(versionFile, 'utf-8').trim();

// Auth0 Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const PORT = process.env.PORT || '5500';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Validate environment variables
validateAuth0Config(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET);

/**
 * Main deployment function
 */
async function deploy() {
  console.log('🚀 Auth0 ACUL Deployment Starting...\n');
  console.log(`Domain: ${AUTH0_DOMAIN}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Version: ${CURRENT_VERSION}\n`);

  try {
    const token = await getManagementToken(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET);
    const screens = getAvailableScreens();

    if (screens.length === 0) {
      console.log('⚠️  No screens to deploy\n');
      return;
    }

    // Use bulk API to deploy all screens with a single call
    await bulkUpdateRendering(AUTH0_DOMAIN, token, BASE_URL, CURRENT_VERSION, screens);

    console.log('='.repeat(50));
    console.log('�� Deployment Summary:');
    console.log(`  ✓ Deployed: ${screens.length} screens`);
    console.log('='.repeat(50));
    console.log('\n✅ All screens deployed successfully!');
    console.log(`📂 View your changes at: https://${AUTH0_DOMAIN}`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploy();
