#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Command line arguments
const args = process.argv.slice(2);
const useReactExamples = args.includes('--react') || args.includes('-r');

// Extract pattern arguments (anything that's not a flag)
const patterns = args.filter(arg => !arg.startsWith('-'));

/**
 * Get installed package version from package.json
 */
function getInstalledVersion() {
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const packageName = useReactExamples ? '@auth0/auth0-acul-react' : '@auth0/auth0-acul-js';
  const version = packageJson.dependencies[packageName];
  
  // Remove ^ or ~ prefix if present
  return version.replace(/^[\^~]/, '');
}

// Get version and construct GitHub URLs
const INSTALLED_VERSION = getInstalledVersion();
const EXAMPLE_SOURCE = useReactExamples ? 'auth0-acul-react' : 'auth0-acul-js';
const GIT_TAG = `${EXAMPLE_SOURCE}@${INSTALLED_VERSION}`;
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/auth0/universal-login/${GIT_TAG}/packages/${EXAMPLE_SOURCE}/examples`;
const GITHUB_API_BASE = `https://api.github.com/repos/auth0/universal-login/contents/packages/${EXAMPLE_SOURCE}/examples?ref=${GIT_TAG}`;
const OUTPUT_DIR = join(__dirname, '..', 'src', 'samples');

/**
 * Fetch list of example files from GitHub API
 */
async function getExampleFiles() {
  console.log(`📋 Discovering example files from ${GIT_TAG}...\n`);
  
  const response = await fetch(GITHUB_API_BASE);
  if (!response.ok) {
    throw new Error(`Failed to fetch file list from tag ${GIT_TAG}: ${response.status}\nMake sure the git tag exists in the repository.`);
  }
  
  const files = await response.json();
  let mdFiles = files
    .filter(file => file.name.endsWith('.md') && file.type === 'file')
    .map(file => file.name)
    .sort();
  
  // Filter by patterns if provided
  if (patterns.length > 0) {
    const originalCount = mdFiles.length;
    mdFiles = mdFiles.filter(filename => 
      patterns.some(pattern => filename.toLowerCase().includes(pattern.toLowerCase()))
    );
    console.log(`✓ Found ${mdFiles.length} example files matching patterns: ${patterns.join(', ')} (${originalCount} total)\n`);
  } else {
    console.log(`✓ Found ${mdFiles.length} example files\n`);
  }
  
  if (mdFiles.length === 0) {
    throw new Error(`No files found matching patterns: ${patterns.join(', ')}`);
  }
  
  return mdFiles;
}

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
 * Process example files
 */
async function processExamples() {
  
  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Get list of example files dynamically
  const EXAMPLE_FILES = await getExampleFiles();
  
  const allSamples = {};
  
  for (const filename of EXAMPLE_FILES) {
    const markdown = await fetchExample(filename);
    
    if (markdown) {
      const samples = extractCodeSamples(markdown, filename);
      const screenName = filename.replace('.md', '');
      
      if (samples.length > 0) {
        // Take the longest sample (most complete code)
        const bestSample = samples.reduce((longest, current) => 
          current.code.length > longest.code.length ? current : longest
        );
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
  
  // Run fix-samples.js automatically
  console.log('\n🔧 Running fix-samples.js...');
  execSync('node scripts/fix-samples.js', { stdio: 'inherit' });
}

// Run the script
const sourceLabel = useReactExamples ? 'React' : 'JavaScript';
const patternInfo = patterns.length > 0 ? ` (filtering by: ${patterns.join(', ')})` : '';
console.log(`📦 Fetching Auth0 ACUL ${sourceLabel} samples from git tag ${GIT_TAG}${patternInfo}...\n`);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node fetch-samples.js [pattern...] [options]\n');
  console.log('Arguments:');
  console.log('  pattern        Filter samples by name pattern (e.g., "login" fetches all *login*.md files)');
  console.log('                 Multiple patterns can be specified: "login mfa signup"\n');
  console.log('Options:');
  console.log('  --react, -r    Fetch React examples from @auth0/auth0-acul-react');
  console.log('  --help, -h     Show this help message\n');
  console.log('Examples:');
  console.log('  node fetch-samples.js                  # Fetch all JavaScript samples');
  console.log('  node scripts/fetch-samples.js login             # Fetch all samples with "login" in filename');
  console.log('  node scripts/fetch-samples.js login mfa         # Fetch samples matching "login" OR "mfa"');
  console.log('  node scripts/fetch-samples.js --react           # Fetch all React samples');
  console.log('  node scripts/fetch-samples.js login --react     # Fetch React samples with "login" in filename');
  console.log('  npm run fetch login                             # Fetch JavaScript samples with "login"');
  console.log('  npm run fetch:react signup                      # Fetch React samples with "signup"\n');
  console.log('Behavior:');
  console.log('  - Fetches from git tag matching the installed package version');
  console.log('  - Automatically runs fix-samples.js after fetching');
  console.log('  - Run this separately before "npm run build"');
  process.exit(0);
}

processExamples().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
