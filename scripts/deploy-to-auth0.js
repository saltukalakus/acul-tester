#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { 
  validateAuth0Config, 
  getManagementToken, 
  getPromptAndScreen, 
  getAvailableScreens 
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
const OUTPUT_DIR = join(DIST_DIR, CURRENT_VERSION);

// Auth0 Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const PORT = process.env.PORT || '5500';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Validate environment variables
validateAuth0Config(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET);

/**
 * Update a specific prompt rendering configuration
 */
async function updatePromptRendering(token, prompt, screen, screenFileName) {
  console.log(`📝 Updating ${prompt}/${screen}...`);
  
  const body = {
    rendering_mode: 'advanced',
    head_tags: [
      {
        tag: 'script',
        attributes: {
          src: `${BASE_URL}/${CURRENT_VERSION}/${screenFileName}/component.js`,
          type: 'module'
        }
      }
    ]
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
    throw new Error(`Failed to update ${prompt}/${screen}: ${response.status} ${error}`);
  }

  const result = await response.json();
  console.log(`  ✓ Updated successfully`);
  
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return result;
}

/**
 * Deploy a specific screen's built assets to Auth0
 */
async function deployScreen(token, screenFileName) {
  const screenPath = join(OUTPUT_DIR, screenFileName);
  
  if (!existsSync(screenPath)) {
    throw new Error(`Built assets not found for ${screenFileName}`);
  }

  const { prompt, screen } = getPromptAndScreen(screenFileName);
  await updatePromptRendering(token, prompt, screen, screenFileName);
}

/**
 * Deploy specific screens
 */
async function deployScreens(token, screenNames) {
  console.log(`📦 Deploying ${screenNames.length} specified screens\n`);
  
  let successCount = 0;
  let failCount = 0;

  for (const screenName of screenNames) {
    try {
      await deployScreen(token, screenName);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to deploy ${screenName}:`, error.message);
      failCount++;
    }
  }

  return { successCount, failCount, total: screenNames.length };
}

/**
 * Deploy all available screens
 */
async function deployAll(token) {
  const screens = getAvailableScreens();

  if (screens.length === 0) {
    console.log('✅ No screens to deploy\n');
    return { successCount: 0, failCount: 0, total: 0 };
  }

  console.log(`📦 Deploying ${screens.length} screens\n`);
  
  let successCount = 0;
  let failCount = 0;

  for (const screenFileName of screens) {
    try {
      await deployScreen(token, screenFileName);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to deploy ${screenFileName}:`, error.message);
      failCount++;
    }
  }

  return { successCount, failCount, total: screens.length };
}

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
    
    // Check if specific screens were requested via command line args
    const requestedScreens = process.argv.slice(2);
    
    let results;
    if (requestedScreens.length > 0) {
      results = await deployScreens(token, requestedScreens);
    } else {
      results = await deployAll(token);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Deployment Summary:');
    console.log(`  ✓ Deployed: ${results.successCount}`);
    console.log(`  ❌ Failed: ${results.failCount}`);
    console.log(`  📝 Total: ${results.total}`);
    console.log('='.repeat(50));

    if (results.failCount === 0 && results.total > 0) {
      console.log('\n✅ All screens deployed successfully!');
      console.log(`📂 View your changes at: https://${AUTH0_DOMAIN}`);
    } else if (results.total === 0) {
      console.log('\n⚠️  No screens were deployed.');
    } else {
      console.log('\n⚠️  Some screens failed to deploy. Check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploy();
