#!/usr/bin/env node
import 'dotenv/config';
import { 
  validateAuth0Config, 
  getManagementToken, 
  getAvailableScreens,
  bulkResetRendering
} from './auth0-utils.js';

// Auth0 Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;

// Validate environment variables
validateAuth0Config(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET);

/**
 * Main cleanup function
 */
async function cleanup() {
  console.log('🧹 Auth0 ACUL Cleanup Starting...\n');
  console.log(`Domain: ${AUTH0_DOMAIN}\n`);

  try {
    const token = await getManagementToken(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET);
    const screens = getAvailableScreens();

    if (screens.length === 0) {
      console.log('✅ No screens to cleanup\n');
      return;
    }

    // Use bulk API to reset all screens with a single call
    await bulkResetRendering(AUTH0_DOMAIN, token, screens);

    console.log('='.repeat(50));
    console.log('📊 Cleanup Summary:');
    console.log(`  ✓ Reset: ${screens.length} screens`);
    console.log('='.repeat(50));
    console.log('\n✅ All screens reset to Auth0 defaults!');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    // Don't exit with error if no screens to cleanup
    if (!error.message.includes('No screens')) {
      process.exit(1);
    }
  }
}

// Run cleanup
cleanup();
