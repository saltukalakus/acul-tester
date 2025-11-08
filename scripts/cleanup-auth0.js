#!/usr/bin/env node
import 'dotenv/config';
import { 
  validateAuth0Config, 
  getManagementToken, 
  getPromptAndScreen, 
  getAvailableScreens 
} from './auth0-utils.js';

// Auth0 Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;

// Validate environment variables
validateAuth0Config(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET);

/**
 * Reset a specific prompt rendering to default (standard mode)
 */
async function resetPromptRendering(token, prompt, screen) {
  console.log(`🔄 Resetting ${prompt}/${screen} to default...`);
  
  const body = {
    rendering_mode: 'standard',
    head_tags: []
  };

  const response = await fetch(
    `https://${AUTH0_DOMAIN}/api/v2/prompts/${prompt}/screen/${screen}/rendering`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to reset ${prompt}/${screen}: ${response.status} ${error}`);
  }

  const result = await response.json();
  console.log(`  ✓ Reset to default`);
  
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return result;
}

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

    console.log(`📦 Found ${screens.length} screens to reset to defaults\n`);

    let successCount = 0;
    let failCount = 0;

    for (const screenFileName of screens) {
      try {
        const { prompt, screen } = getPromptAndScreen(screenFileName);
        await resetPromptRendering(token, prompt, screen);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Failed to reset ${screenFileName}:`, error.message);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Cleanup Summary:');
    console.log(`  ✓ Reset: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log(`  📝 Total: ${screens.length}`);
    console.log('='.repeat(50));

    if (failCount === 0) {
      console.log('\n✅ All screens reset to Auth0 defaults!');
    } else {
      console.log('\n⚠️  Some screens failed to reset. Check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanup();
