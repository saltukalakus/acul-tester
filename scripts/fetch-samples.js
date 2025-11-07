#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/auth0/universal-login/master/packages/auth0-acul-js/examples';
const OUTPUT_DIR = join(__dirname, '..', 'src', 'samples');

// List of example files to fetch
const EXAMPLE_FILES = [
  'login.md',
  'login-id.md',
  'login-password.md',
  'signup.md',
  'signup-id.md',
  'signup-password.md',
  'consent.md',
  'device-code-confirmation.md',
  'email-otp-challenge.md',
  'email-verification-result.md',
  'login-email-verification.md',
  'logout.md',
  'logout-complete.md',
  'mfa-enroll-result.md',
  'mfa-login-options.md',
  'mfa-otp-enrollment-code.md',
  'organization-picker.md',
  'organization-selection.md',
  'redeem-ticket.md',
  'reset-password-request.md'
];

/**
 * Extract React/TailwindCSS code blocks from markdown
 */
function extractCodeSamples(markdown, filename) {
  const samples = [];
  const screenName = filename.replace('.md', '');
  
  // Match code blocks that contain React/TailwindCSS examples
  const codeBlockRegex = /```(?:tsx|jsx|typescript|javascript)\n([\s\S]*?)```/g;
  let match;
  let index = 0;
  
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const code = match[1];
    
    // Check if this looks like a React component (has JSX/TSX)
    if (code.includes('React') || code.includes('className') || code.includes('import')) {
      samples.push({
        name: `${screenName}-${index}`,
        code: code.trim(),
        type: 'react'
      });
      index++;
    }
  }
  
  return samples;
}

/**
 * Convert extracted sample to a complete React component file
 */
function convertToComponent(sample, screenName) {
  let code = sample.code;
  
  // If it's already a complete component, fix imports if needed
  if (code.includes('export default') || code.includes('export const')) {
    // Fix missing useMemo import
    if (code.includes('useMemo')) {
      // Add useMemo to existing React import with hooks
      if (code.match(/import React, \{[^}]+\} from ['"]react['"]/)) {
        code = code.replace(
          /import React, \{([^}]+)\} from ['"]react['"]/,
          (match, hooks) => {
            const hooksList = hooks.split(',').map(h => h.trim());
            if (!hooksList.includes('useMemo')) {
              hooksList.push('useMemo');
            }
            return `import React, { ${hooksList.join(', ')} } from 'react'`;
          }
        );
      }
      // Add useMemo to simple React import
      else if (code.includes("import React from 'react'")) {
        code = code.replace(
          "import React from 'react'",
          "import React, { useMemo } from 'react'"
        );
      }
    }
    
    return code;
  }
  
  // Otherwise, wrap it in a basic component structure
  const componentName = screenName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Add missing import for useMemo if needed
  let imports = 'import React from \'react\';';
  if (code.includes('useMemo') && !code.includes('import')) {
    imports = 'import React, { useMemo } from \'react\';';
  }
  if (code.includes('useState') && !code.includes('import')) {
    imports = 'import React, { useState, useMemo } from \'react\';';
  }
  
  return `${imports}

${code}

export default ${componentName}Screen;
`;
}

/**
 * Fetch a single example file from GitHub
 */
async function fetchExample(filename) {
  const url = `${GITHUB_RAW_BASE}/${filename}`;
  console.log(`Fetching ${filename}...`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error.message);
    return null;
  }
}

/**
 * Process all example files
 */
async function processExamples() {
  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const allSamples = {};
  
  for (const filename of EXAMPLE_FILES) {
    const markdown = await fetchExample(filename);
    
    if (markdown) {
      const samples = extractCodeSamples(markdown, filename);
      const screenName = filename.replace('.md', '');
      
      if (samples.length > 0) {
        // Take the most complete sample (usually the last one with TailwindCSS)
        const bestSample = samples[samples.length - 1];
        const componentCode = convertToComponent(bestSample, screenName);
        
        // Save as individual component file
        const outputPath = join(OUTPUT_DIR, `${screenName}.tsx`);
        writeFileSync(outputPath, componentCode, 'utf-8');
        console.log(`  ✓ Saved ${screenName}.tsx (${samples.length} samples found)`);
        
        allSamples[screenName] = {
          filename: `${screenName}.tsx`,
          samplesCount: samples.length
        };
      } else {
        console.log(`  ⚠ No code samples found in ${filename}`);
      }
    }
  }
  
  // Create an index file that exports all components
  const indexContent = Object.keys(allSamples)
    .map(name => {
      const componentName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      return `export { default as ${componentName} } from './${name}';`;
    })
    .join('\n');
  
  writeFileSync(join(OUTPUT_DIR, 'index.ts'), indexContent + '\n', 'utf-8');
  console.log('\n✓ Created index.ts');
  
  // Create a manifest file
  const manifestContent = JSON.stringify(allSamples, null, 2);
  writeFileSync(join(OUTPUT_DIR, 'manifest.json'), manifestContent, 'utf-8');
  console.log('✓ Created manifest.json');
  
  console.log(`\n✅ Successfully processed ${Object.keys(allSamples).length} examples`);
}

// Run the script
console.log('📦 Fetching Auth0 ACUL samples from GitHub...\n');
processExamples().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
