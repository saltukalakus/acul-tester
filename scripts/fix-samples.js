#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SAMPLES_DIR = join(__dirname, '..', 'src', 'samples');

console.log('🔧 Fixing sample code issues...\n');

// Fix login.tsx - remove getActiveIdentifiers() call
const loginPath = join(SAMPLES_DIR, 'login.tsx');
if (readFileSync(loginPath, 'utf-8').includes('getActiveIdentifiers')) {
  let loginCode = readFileSync(loginPath, 'utf-8');
  
  // Remove useMemo import if not needed elsewhere
  loginCode = loginCode.replace(
    /import React, { useState, useMemo } from 'react';/g,
    "import React, { useState } from 'react';"
  );
  
  // Remove the problematic useMemo line
  loginCode = loginCode.replace(
    /const activeIdentifiers = useMemo\(\(\) => loginManager\.getActiveIdentifiers\(\), \[\]\);/g,
    ''
  );
  
  // Simplify getIdentifierLabel - use more flexible regex
  loginCode = loginCode.replace(
    /const getIdentifierLabel = \(\) => \{[\s\S]*?activeIdentifiers[\s\S]*?\};/,
    `const getIdentifierLabel = () => {
    return 'Enter your email or phone';
  };`
  );
  
  writeFileSync(loginPath, loginCode, 'utf-8');
  console.log('  ✓ Fixed login.tsx');
}

console.log('\n✅ Sample fixes complete!');
