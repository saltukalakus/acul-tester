#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_DIR = join(__dirname, '..', 'dist');
const SAMPLES_DIR = join(__dirname, '..', 'src', 'samples');

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
 * Complete mapping from Auth0 Universal Login Customization settings
 */
function getPromptAndScreen(screenFileName) {
  // Complete prompt to screen mappings
  const PROMPT_SCREEN_MAP = {
    // Captcha
    'interstitial-captcha': { prompt: 'captcha', screen: 'interstitial-captcha' },
    
    // Common
    'redeem-ticket': { prompt: 'common', screen: 'redeem-ticket' },
    
    // Consent
    'consent': { prompt: 'consent', screen: 'consent' },
    'customized-consent': { prompt: 'customized-consent', screen: 'customized-consent' },
    
    // Device Flow
    'device-code-activation': { prompt: 'device-flow', screen: 'device-code-activation' },
    'device-code-activation-allowed': { prompt: 'device-flow', screen: 'device-code-activation-allowed' },
    'device-code-activation-denied': { prompt: 'device-flow', screen: 'device-code-activation-denied' },
    'device-code-confirmation': { prompt: 'device-flow', screen: 'device-code-confirmation' },
    
    // Email Identifier Challenge
    'email-identifier-challenge': { prompt: 'email-identifier-challenge', screen: 'email-identifier-challenge' },
    
    // Email OTP Challenge
    'email-otp-challenge': { prompt: 'email-otp-challenge', screen: 'email-otp-challenge' },
    
    // Email Verification
    'email-verification-result': { prompt: 'email-verification', screen: 'email-verification-result' },
    
    // Invitation
    'accept-invitation': { prompt: 'invitation', screen: 'accept-invitation' },
    
    // Login
    'login': { prompt: 'login', screen: 'login' },
    'login-email-verification': { prompt: 'login-email-verification', screen: 'login-email-verification' },
    'login-id': { prompt: 'login-id', screen: 'login-id' },
    'login-password': { prompt: 'login-password', screen: 'login-password' },
    
    // Login Passwordless
    'login-passwordless-email-code': { prompt: 'login-passwordless', screen: 'login-passwordless-email-code' },
    'login-passwordless-sms-otp': { prompt: 'login-passwordless', screen: 'login-passwordless-sms-otp' },
    
    // Logout
    'logout': { prompt: 'logout', screen: 'logout' },
    'logout-aborted': { prompt: 'logout', screen: 'logout-aborted' },
    'logout-complete': { prompt: 'logout', screen: 'logout-complete' },
    
    // MFA
    'mfa-begin-enroll-options': { prompt: 'mfa', screen: 'mfa-begin-enroll-options' },
    'mfa-detect-browser-capabilities': { prompt: 'mfa', screen: 'mfa-detect-browser-capabilities' },
    'mfa-enroll-result': { prompt: 'mfa', screen: 'mfa-enroll-result' },
    'mfa-login-options': { prompt: 'mfa', screen: 'mfa-login-options' },
    
    // MFA Email
    'mfa-email-challenge': { prompt: 'mfa-email', screen: 'mfa-email-challenge' },
    'mfa-email-list': { prompt: 'mfa-email', screen: 'mfa-email-list' },
    
    // MFA OTP
    'mfa-otp-challenge': { prompt: 'mfa-otp', screen: 'mfa-otp-challenge' },
    'mfa-otp-enrollment-code': { prompt: 'mfa-otp', screen: 'mfa-otp-enrollment-code' },
    'mfa-otp-enrollment-qr': { prompt: 'mfa-otp', screen: 'mfa-otp-enrollment-qr' },
    
    // MFA Phone
    'mfa-phone-challenge': { prompt: 'mfa-phone', screen: 'mfa-phone-challenge' },
    'mfa-phone-enrollment': { prompt: 'mfa-phone', screen: 'mfa-phone-enrollment' },
    
    // MFA Push
    'mfa-push-challenge-push': { prompt: 'mfa-push', screen: 'mfa-push-challenge-push' },
    'mfa-push-enrollment-qr': { prompt: 'mfa-push', screen: 'mfa-push-enrollment-qr' },
    'mfa-push-list': { prompt: 'mfa-push', screen: 'mfa-push-list' },
    'mfa-push-welcome': { prompt: 'mfa-push', screen: 'mfa-push-welcome' },
    
    // MFA Recovery Code
    'mfa-recovery-code-challenge': { prompt: 'mfa-recovery-code', screen: 'mfa-recovery-code-challenge' },
    'mfa-recovery-code-challenge-new-code': { prompt: 'mfa-recovery-code', screen: 'mfa-recovery-code-challenge-new-code' },
    'mfa-recovery-code-enrollment': { prompt: 'mfa-recovery-code', screen: 'mfa-recovery-code-enrollment' },
    
    // MFA SMS
    'mfa-country-codes': { prompt: 'mfa-sms', screen: 'mfa-country-codes' },
    'mfa-sms-challenge': { prompt: 'mfa-sms', screen: 'mfa-sms-challenge' },
    'mfa-sms-enrollment': { prompt: 'mfa-sms', screen: 'mfa-sms-enrollment' },
    'mfa-sms-list': { prompt: 'mfa-sms', screen: 'mfa-sms-list' },
    
    // MFA Voice
    'mfa-voice-challenge': { prompt: 'mfa-voice', screen: 'mfa-voice-challenge' },
    'mfa-voice-enrollment': { prompt: 'mfa-voice', screen: 'mfa-voice-enrollment' },
    
    // MFA WebAuthn
    'mfa-webauthn-change-key-nickname': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-change-key-nickname' },
    'mfa-webauthn-enrollment-success': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-enrollment-success' },
    'mfa-webauthn-error': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-error' },
    'mfa-webauthn-not-available-error': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-not-available-error' },
    'mfa-webauthn-platform-challenge': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-platform-challenge' },
    'mfa-webauthn-platform-enrollment': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-platform-enrollment' },
    'mfa-webauthn-roaming-challenge': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-roaming-challenge' },
    'mfa-webauthn-roaming-enrollment': { prompt: 'mfa-webauthn', screen: 'mfa-webauthn-roaming-enrollment' },
    
    // Organizations
    'organization-picker': { prompt: 'organizations', screen: 'organization-picker' },
    'organization-selection': { prompt: 'organizations', screen: 'organization-selection' },
    
    // Passkeys
    'passkey-enrollment': { prompt: 'passkeys', screen: 'passkey-enrollment' },
    'passkey-enrollment-local': { prompt: 'passkeys', screen: 'passkey-enrollment-local' },
    
    // Phone Identifier Challenge
    'phone-identifier-challenge': { prompt: 'phone-identifier-challenge', screen: 'phone-identifier-challenge' },
    
    // Phone Identifier Enrollment
    'phone-identifier-enrollment': { prompt: 'phone-identifier-enrollment', screen: 'phone-identifier-enrollment' },
    
    // Reset Password
    'reset-password': { prompt: 'reset-password', screen: 'reset-password' },
    'reset-password-email': { prompt: 'reset-password', screen: 'reset-password-email' },
    'reset-password-error': { prompt: 'reset-password', screen: 'reset-password-error' },
    'reset-password-mfa-email-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-email-challenge' },
    'reset-password-mfa-otp-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-otp-challenge' },
    'reset-password-mfa-phone-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-phone-challenge' },
    'reset-password-mfa-push-challenge-push': { prompt: 'reset-password', screen: 'reset-password-mfa-push-challenge-push' },
    'reset-password-mfa-recovery-code-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-recovery-code-challenge' },
    'reset-password-mfa-sms-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-sms-challenge' },
    'reset-password-mfa-voice-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-voice-challenge' },
    'reset-password-mfa-webauthn-platform-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-webauthn-platform-challenge' },
    'reset-password-mfa-webauthn-roaming-challenge': { prompt: 'reset-password', screen: 'reset-password-mfa-webauthn-roaming-challenge' },
    'reset-password-request': { prompt: 'reset-password', screen: 'reset-password-request' },
    'reset-password-success': { prompt: 'reset-password', screen: 'reset-password-success' },
    
    // Signup
    'signup': { prompt: 'signup', screen: 'signup' },
    'signup-id': { prompt: 'signup-id', screen: 'signup-id' },
    'signup-password': { prompt: 'signup-password', screen: 'signup-password' },
    
    // Brute Force Protection (if they exist in samples)
    'brute-force-protection-unblock': { prompt: 'login', screen: 'brute-force-protection-unblock' },
    'brute-force-protection-unblock-success': { prompt: 'login', screen: 'brute-force-protection-unblock-success' },
    'brute-force-protection-unblock-failure': { prompt: 'login', screen: 'brute-force-protection-unblock-failure' },
  };
  
  // Return mapping or fallback to screen name as both prompt and screen
  return PROMPT_SCREEN_MAP[screenFileName] || { prompt: screenFileName, screen: screenFileName };
}

/**
 * Get list of available screens from src/samples directory
 */
function getAvailableScreens() {
  if (!existsSync(SAMPLES_DIR)) {
    throw new Error('No samples directory found. Run "npm run fetch-samples" first.');
  }
  
  const files = readdirSync(SAMPLES_DIR);
  const screens = files
    .filter(file => file.endsWith('.tsx'))
    .filter(file => !file.includes('.wrapper.')) // Exclude wrapper files
    .map(file => file.replace('.tsx', ''));
  
  return screens;
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

    // Get list of screens from src/samples directory
    const screens = getAvailableScreens();

    console.log(`📦 Found ${screens.length} screens in src/samples/\n`);

    let successCount = 0;
    let failCount = 0;

    // Deploy each screen
    for (const screenFileName of screens) {
      try {
        // Check if source file exists in src/samples
        const sourcePath = join(SAMPLES_DIR, `${screenFileName}.tsx`);
        if (!existsSync(sourcePath)) {
          console.log(`  ⚠️  Skipping ${screenFileName} - source file not found in src/samples`);
          failCount++;
          continue;
        }
        
        // Check if built component exists
        const componentPath = join(OUTPUT_DIR, screenFileName, 'component.js');
        if (!existsSync(componentPath)) {
          console.log(`  ⚠️  Skipping ${screenFileName} - component not built (run "npm run build")`);
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
        // Check if source file exists in src/samples
        const sourcePath = join(SAMPLES_DIR, `${screenFileName}.tsx`);
        if (!existsSync(sourcePath)) {
          console.error(`❌ Screen '${screenFileName}' not found in src/samples/`);
          console.error(`   Available screens: ${getAvailableScreens().join(', ')}`);
          failCount++;
          continue;
        }
        
        // Check if built component exists
        const componentPath = join(OUTPUT_DIR, screenFileName, 'component.js');
        if (!existsSync(componentPath)) {
          console.error(`❌ Screen '${screenFileName}' not built. Run "npm run build" first.`);
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
