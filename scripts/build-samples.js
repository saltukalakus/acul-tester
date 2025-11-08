#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as esbuild from 'esbuild';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SAMPLES_DIR = join(__dirname, '..', 'src', 'samples');
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = parseInt(process.env.PORT || '5500', 10);

console.log('🔨 Building samples...\n');

// Check if samples exist
if (!existsSync(SAMPLES_DIR) || !existsSync(join(SAMPLES_DIR, 'manifest.json'))) {
  console.error('❌ No samples found in src/samples/');
  console.error('   Run "npm run fetch-samples" first to download samples.\n');
  console.error('   Examples:');
  console.error('     npm run fetch-samples           # Fetch all samples');
  console.error('     npm run fetch-samples login     # Fetch only login-related samples');
  process.exit(1);
}

// Generate a version hash for cache busting
const VERSION_HASH = crypto.randomBytes(8).toString('hex');
const OUTPUT_DIR = join(DIST_DIR, `v-${VERSION_HASH}`);

console.log(`📦 Version: v-${VERSION_HASH}\n`);

// Clean old versions but keep dist directory
if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true });
}

const versionsFile = join(DIST_DIR, '.versions');
if (existsSync(versionsFile)) {
  const oldVersions = readFileSync(versionsFile, 'utf-8').split('\n').filter(Boolean);
  // Remove old version directories
  oldVersions.forEach(oldVersion => {
    const oldPath = join(DIST_DIR, oldVersion);
    if (existsSync(oldPath)) {
      rmSync(oldPath, { recursive: true, force: true });
      console.log(`🗑️  Removed old version: ${oldVersion}`);
    }
  });
}

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

// Read actual .tsx files from directory instead of manifest
// This allows users to delete samples they don't need
const allFiles = readdirSync(SAMPLES_DIR);
const samples = allFiles
  .filter(file => file.endsWith('.tsx'))
  .filter(file => !file.includes('.wrapper.')) // Exclude wrapper files
  .map(file => file.replace('.tsx', ''));

console.log('CSS...');
execSync(`npx tailwindcss -i ./src/samples-styles.css -o ${join(OUTPUT_DIR, 'styles.css')} --minify`, { stdio: 'inherit' });

console.log('\nSamples...');
for (const name of samples) {
  const dir = join(OUTPUT_DIR, name);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  
  // Copy source TSX file
  const sourcePath = join(SAMPLES_DIR, `${name}.tsx`);
  const code = readFileSync(sourcePath, 'utf-8');
  writeFileSync(join(dir, 'component.tsx'), code, 'utf-8');
  
  // Build JavaScript module using esbuild
  try {
    // First, create a wrapper file that renders the component
    const wrapperPath = join(SAMPLES_DIR, `${name}.wrapper.tsx`);
    
    // Check if the sample uses named export or default export
    const sampleContent = readFileSync(sourcePath, 'utf-8');
    const hasNamedExport = /export const \w+: React\.FC/.test(sampleContent);
    const componentName = hasNamedExport 
      ? sampleContent.match(/export const (\w+): React\.FC/)?.[1] 
      : 'Component';
    
    const importStatement = hasNamedExport
      ? `import { ${componentName} } from './${name}';`
      : `import Component from './${name}';`;
    
    const componentToRender = hasNamedExport ? componentName : 'Component';
    
    const wrapperCode = `
import React from 'react';
import { createRoot } from 'react-dom/client';
${importStatement}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponent);
} else {
  initComponent();
}

function initComponent() {
  // Create a container div for the React app
  let container = document.getElementById('auth0-acul-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'auth0-acul-root';
    document.body.appendChild(container);
  }
  
  const reactRoot = createRoot(container);
  reactRoot.render(<${componentToRender} />);
}
`;
    writeFileSync(wrapperPath, wrapperCode, 'utf-8');
    
    await esbuild.build({
      entryPoints: [wrapperPath],
      bundle: true,
      format: 'esm',
      outfile: join(dir, 'component.js'),
      jsx: 'automatic',
      platform: 'browser',
      target: ['es2022'], // Support top-level await
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
      // Note: Removed 'external' - now bundling everything including @auth0/auth0-acul-js
      minify: false, // Keep readable for development
      sourcemap: true,
      logLevel: 'silent' // Suppress build errors for incomplete samples
    });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    // Some samples may have missing dependencies or be incomplete
    // Create a basic placeholder JS file so deployment can still reference it
    const placeholderJS = `// Build failed for ${name} due to missing dependencies
// Original source: ${name}.tsx
console.warn('Component ${name} has build errors and may not function correctly');
export default function Placeholder() {
  return null;
}`;
    writeFileSync(join(dir, 'component.js'), placeholderJS, 'utf-8');
    console.log(`  ⚠️  ${name} (created placeholder - has missing dependencies)`);
  }
}

const css = readFileSync(join(OUTPUT_DIR, 'styles.css'), 'utf-8');
const index = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Auth0 ACUL v-${VERSION_HASH}</title><link rel="stylesheet" href="/v-${VERSION_HASH}/styles.css"></head>
<body class="bg-gray-50 p-8"><div class="max-w-4xl mx-auto">
<h1 class="text-3xl font-bold mb-6">Auth0 ACUL Samples</h1>
<div class="bg-blue-50 p-4 rounded mb-6">
<p class="font-semibold">Version: <code>v-${VERSION_HASH}</code></p>
<p class="font-semibold">CSS: <code>http://localhost:${PORT}/v-${VERSION_HASH}/styles.css</code> (${Math.round(css.length/1024)} KB)</p>
</div>
<div class="grid grid-cols-3 gap-4">
${samples.map(s => `<a href="/v-${VERSION_HASH}/${s}/component.tsx" class="p-4 bg-white rounded shadow">${s}</a>`).join('')}
</div></div></body></html>`;

writeFileSync(join(OUTPUT_DIR, 'index.html'), index, 'utf-8');

// Save version info  
const versions = existsSync(versionsFile) ? readFileSync(versionsFile, 'utf-8').split('\n').filter(Boolean) : [];
versions.push(`v-${VERSION_HASH}`);
writeFileSync(versionsFile, versions.join('\n'), 'utf-8');

// Save current version for deployment script
writeFileSync(join(DIST_DIR, '.current-version'), `v-${VERSION_HASH}`, 'utf-8');

console.log(`\n✓ Done! Version: v-${VERSION_HASH}`);
console.log(`✓ Run: npm run serve`);

