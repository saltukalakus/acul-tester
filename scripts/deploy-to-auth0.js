#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

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
const BASE_URL = process.env.BASE_URL || 'http://localhost:5500';
const CSS_URL = `${BASE_URL}/${CURRENT_VERSION}/styles.css`;

// Validate environment variables
if (!AUTH0_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing required environment variables!');
  console.error('Required: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET');
  console.error('Create a .env file with these values.');
  process.exit(1);
}

// Screen name mapping (Auth0 API uses different names than file names)
const SCREEN_MAPPING = {
  'login': 'login',
  'login-id': 'login-id',
  'login-password': 'login-password',
  'signup': 'signup',
  'signup-id': 'signup-id',
  'signup-password': 'signup-password',
  'consent': 'consent',
  'device-code-confirmation': 'device-code-confirmation',
  'email-otp-challenge': 'email-otp-challenge',
  'email-verification-result': 'email-verification-result',
  'login-email-verification': 'login-email-verification',
  'logout': 'logout',
  'logout-complete': 'logout-complete',
  'mfa-enroll-result': 'mfa-enroll-result',
  'mfa-login-options': 'mfa-login-options',
  'mfa-otp-enrollment-code': 'mfa-otp-enrollment-code',
  'organization-picker': 'organization-picker',
  'organization-selection': 'organization-selection',
  'redeem-ticket': 'redeem-ticket',
  'reset-password-request': 'reset-password-request'
};

/**
 * Get Management API token using client credentials
 */
async function getManagementToken() {
  console.log('🔐 Authenticating with Auth0...');
  
  const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get token: ${response.status} ${error}`);
  }

  const data = await response.json();
  console.log('✓ Authentication successful\n');
  return data.access_token;
}

/**
 * Update a specific prompt rendering configuration
 */
async function updatePromptRendering(token, prompt, screen, screenFileName) {
  console.log(`📝 Updating ${prompt}/${screen}...`);
  
  const body = {
    rendering_mode: 'advanced',
    head_tags: [
      {
        tag: 'link',
        attributes: {
          rel: 'stylesheet',
          href: CSS_URL
        }
      },
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
  return result;
}

/**
 * Map screen file names to Auth0 prompt and screen names
 * Based on Auth0 API: /api/v2/prompts/{prompt}/screen/{screen}/rendering
 * 
 * Auth0 uses specific prompt types, and screens belong to those prompts.
 * For example: mfa-login-options screen belongs to the "mfa" prompt
 */
function getPromptAndScreen(screenFileName) {
  // Special mappings for screens that belong to different prompts
  const specialMappings = {
    // MFA screens belong to 'mfa' prompt
    'mfa-login-options': 'mfa',
    'mfa-enroll-result': 'mfa',
    
    // MFA OTP enrollment belongs to 'mfa-otp' prompt
    'mfa-otp-enrollment-code': 'mfa-otp',
    
    // Organization screens
    'organization-picker': 'organizations',
    'organization-selection': 'organizations',
    
    // Device code confirmation
    'device-code-confirmation': 'device-flow',
    
    // Email verification screens
    'email-verification-result': 'email-verification',
    
    // Common prompt screens
    'redeem-ticket': 'common',
    
    // Logout screens belong to 'logout' prompt
    'logout-complete': 'logout',
    
    // Reset password
    'reset-password-request': 'reset-password'
  };
  
  // Return special mapping if exists, otherwise prompt === screen
  return specialMappings[screenFileName] 
    ? { prompt: specialMappings[screenFileName], screen: screenFileName }
    : { prompt: screenFileName, screen: screenFileName };
}

/**
 * Deploy all screens to Auth0
 */
async function deployAll() {
  console.log('🚀 Auth0 Deployment Starting...\n');
  console.log(`Domain: ${AUTH0_DOMAIN}`);
  console.log(`CSS URL: ${CSS_URL}\n`);

  try {
    // Get access token
    const token = await getManagementToken();

    // Get list of screens to deploy
    const manifest = JSON.parse(
      readFileSync(join(__dirname, '..', 'src', 'samples', 'manifest.json'), 'utf-8')
    );
    const screens = Object.keys(manifest);

    console.log(`📦 Found ${screens.length} screens to deploy\n`);

    let successCount = 0;
    let failCount = 0;

    // Deploy each screen
    for (const screenFileName of screens) {
      try {
        const componentPath = join(OUTPUT_DIR, screenFileName, 'component.js');
        
        if (!existsSync(componentPath)) {
          console.log(`  ⚠️  Skipping ${screenFileName} - component file not found`);
          failCount++;
          continue;
        }

        const { prompt, screen } = getPromptAndScreen(screenFileName);
        
        await updatePromptRendering(token, prompt, screen, screenFileName);
        successCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ❌ Failed to deploy ${screenFileName}:`, error.message);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Deployment Summary:');
    console.log(`  ✓ Success: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log(`  📝 Total: ${screens.length}`);
    console.log('='.repeat(50));

    if (failCount === 0) {
      console.log('\n✅ All screens deployed successfully!');
      console.log(`\n💡 Version: ${CURRENT_VERSION}`);
      console.log(`📍 Your Auth0 tenant is now configured to load from:`);
      console.log(`   📄 CSS: ${CSS_URL}`);
      console.log(`   📦 JS: ${BASE_URL}/${CURRENT_VERSION}/{screen}/component.js`);
      console.log(`\n🚀 Make sure your local server is running: npm run serve`);
    } else {
      console.log('\n⚠️  Some screens failed to deploy. Check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

/**
 * Deploy specific screens
 */
async function deployScreens(screenNames) {
  console.log('🚀 Auth0 Deployment Starting...\n');
  console.log(`Domain: ${AUTH0_DOMAIN}`);
  console.log(`CSS URL: ${CSS_URL}`);
  console.log(`Screens: ${screenNames.join(', ')}\n`);

  try {
    const token = await getManagementToken();

    let successCount = 0;
    let failCount = 0;

    for (const screenFileName of screenNames) {
      try {
        const componentPath = join(OUTPUT_DIR, screenFileName, 'component.js');
        
        if (!existsSync(componentPath)) {
          console.error(`❌ Screen '${screenFileName}' not found in dist/`);
          failCount++;
          continue;
        }

        const { prompt, screen } = getPromptAndScreen(screenFileName);
        
        await updatePromptRendering(token, prompt, screen, screenFileName);
        successCount++;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ❌ Failed to deploy ${screenFileName}:`, error.message);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Deployment Summary:');
    console.log(`  ✓ Success: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log('='.repeat(50));

    if (failCount === 0) {
      console.log('\n✅ Deployment successful!');
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  // Deploy all screens
  deployAll();
} else {
  // Deploy specific screens
  deployScreens(args);
}
