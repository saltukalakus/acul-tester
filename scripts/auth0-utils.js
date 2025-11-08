#!/usr/bin/env node
/**
 * Shared utilities for Auth0 Management API operations
 */

import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SAMPLES_DIR = join(__dirname, '..', 'src', 'samples');

/**
 * Validate Auth0 environment variables
 */
export function validateAuth0Config(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET) {
  if (!AUTH0_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing required environment variables!');
    console.error('Required: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET');
    console.error('Create a .env file with these values.');
    process.exit(1);
  }
}

/**
 * Get Management API token using client credentials
 */
export async function getManagementToken(AUTH0_DOMAIN, CLIENT_ID, CLIENT_SECRET) {
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
 * Map screen file names to Auth0 prompt and screen names
 * Based on Auth0 API: /api/v2/prompts/{prompt}/screen/{screen}/rendering
 */
export function getPromptAndScreen(screenFileName) {
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
    
    // Brute Force Protection
    'brute-force-protection-unblock': { prompt: 'login', screen: 'brute-force-protection-unblock' },
    'brute-force-protection-unblock-success': { prompt: 'login', screen: 'brute-force-protection-unblock-success' },
    'brute-force-protection-unblock-failure': { prompt: 'login', screen: 'brute-force-protection-unblock-failure' },
  };
  
  return PROMPT_SCREEN_MAP[screenFileName] || { prompt: screenFileName, screen: screenFileName };
}

/**
 * Get list of available screens from src/samples directory
 */
export function getAvailableScreens() {
  if (!existsSync(SAMPLES_DIR)) {
    return [];
  }
  
  const files = readdirSync(SAMPLES_DIR);
  const screens = files
    .filter(file => file.endsWith('.tsx'))
    .filter(file => !file.includes('.wrapper.'))
    .map(file => file.replace('.tsx', ''));
  
  return screens;
}
