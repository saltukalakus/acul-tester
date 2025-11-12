#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SAMPLES_DIR = join(__dirname, '..', 'src', 'samples');

console.log('🔧 Fixing sample code issues...\n');

// Fix getActiveIdentifiers -> getLoginIdentifiers (API change in alpha.2)
const allFiles = readdirSync(SAMPLES_DIR).filter(f => f.endsWith('.tsx'));
let fixedIdentifiers = 0;

for (const file of allFiles) {
  const filePath = join(SAMPLES_DIR, file);
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // Fix getActiveIdentifiers -> getLoginIdentifiers
    if (content.includes('getActiveIdentifiers')) {
      content = content.replace(/getActiveIdentifiers/g, 'getLoginIdentifiers');
      modified = true;
    }
    
    // Add fallback for getLoginIdentifiers if it doesn't exist in SDK
    // This handles alpha.2 SDK versions that might not have this method
    if (content.includes('loginManager.getLoginIdentifiers()') && !content.includes('getLoginIdentifiers ?? ')) {
      content = content.replace(
        /loginManager\.getLoginIdentifiers\(\)/g,
        "(loginManager.getLoginIdentifiers?.() ?? loginManager.getActiveIdentifiers?.() ?? ['email'])"
      );
      modified = true;
    }
    
    // Add fallback for getEnabledIdentifiers in signup screens
    // Include all common identifiers so the form shows all fields
    if (content.includes('signupManager.getEnabledIdentifiers()') && !content.includes('getEnabledIdentifiers ?? ')) {
      content = content.replace(
        /signupManager\.getEnabledIdentifiers\(\)/g,
        "(signupManager.getEnabledIdentifiers?.() ?? [{ type: 'email', required: true }, { type: 'username', required: false }, { type: 'phone', required: false }])"
      );
      modified = true;
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      fixedIdentifiers++;
    }
  } catch (err) {
    // Skip files that can't be read
  }
}

if (fixedIdentifiers > 0) {
  console.log(`  ✓ Fixed login identifier methods in ${fixedIdentifiers} file(s)`);
}

// Fix interstitial-captcha.tsx - typo in import path
const captchaPath = join(SAMPLES_DIR, 'interstitial-captcha.tsx');
try {
  let captchaCode = readFileSync(captchaPath, 'utf-8');
  if (captchaCode.includes('intersitial-captcha')) {
    captchaCode = captchaCode.replace(
      /from '@auth0\/auth0-acul-js\/intersitial-captcha'/g,
      "from '@auth0/auth0-acul-js/interstitial-captcha'"
    );
    writeFileSync(captchaPath, captchaCode, 'utf-8');
    console.log('  ✓ Fixed interstitial-captcha.tsx (typo in import)');
  }
} catch (err) {
  // File might not exist
}

// Fix login-id.tsx - broken sample with undefined variable
const loginIdPath = join(SAMPLES_DIR, 'login-id.tsx');
try {
  let loginIdCode = readFileSync(loginIdPath, 'utf-8');
  // Check if it has the broken pattern (uses alternateConnections without loginIdManager.transaction)
  if (loginIdCode.includes('const selectedConnection = alternateConnections[0]')) {
    loginIdCode = loginIdCode.replace(
      /const selectedConnection = alternateConnections\[0\];/,
      'const selectedConnection = loginIdManager.transaction.alternateConnections[0];'
    );
    writeFileSync(loginIdPath, loginIdCode, 'utf-8');
    console.log('  ✓ Fixed login-id.tsx (undefined alternateConnections)');
  }
} catch (err) {
  // File might not exist
}

// Fix mfa-push-welcome.tsx - typo in import statement (double 'i')
const mfaPushWelcomePath = join(SAMPLES_DIR, 'mfa-push-welcome.tsx');
try {
  let mfaCode = readFileSync(mfaPushWelcomePath, 'utf-8');
  if (mfaCode.startsWith('iimport')) {
    mfaCode = mfaCode.replace(/^iimport/, 'import');
    writeFileSync(mfaPushWelcomePath, mfaCode, 'utf-8');
    console.log('  ✓ Fixed mfa-push-welcome.tsx (typo in import)');
  }
} catch (err) {
  // File might not exist
}

// Convert utility examples to placeholders (not actual screen components)
const unsupportedFiles = [
  'get-current-screen-options.tsx',
  'get-current-theme-options.tsx'
];

for (const file of unsupportedFiles) {
  const filePath = join(SAMPLES_DIR, file);
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Convert utility examples to placeholder screens
    const screenName = file.replace('.tsx', '').split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join('');
    
    const placeholder = `import React from 'react';

// This is a utility function example, not an actual screen component
// See Auth0 documentation for usage: https://auth0.github.io/universal-login

const ${screenName}Screen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Utility Function Example</h1>
        <p className="text-gray-600 mb-4">
          This file demonstrates a utility function from @auth0/auth0-acul-js.
          It is not meant to be deployed as a screen component.
        </p>
        <p className="text-sm text-gray-500">
          Refer to the Auth0 Universal Login documentation for implementation details.
        </p>
      </div>
    </div>
  );
};

export default ${screenName}Screen;
`;
    
    writeFileSync(filePath, placeholder, 'utf-8');
    console.log(`  ✓ Converted ${file} to placeholder screen`);
  } catch (err) {
    // File might not exist
  }
}

console.log('\n✅ Sample fixes complete!');
