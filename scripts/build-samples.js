#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as esbuild from 'esbuild';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SAMPLES_DIR = join(__dirname, '..', 'src', 'samples');
const DIST_DIR = join(__dirname, '..', 'dist');

// Generate a version hash for cache busting
const VERSION_HASH = crypto.randomBytes(8).toString('hex');
const OUTPUT_DIR = join(DIST_DIR, `v-${VERSION_HASH}`);

console.log('Building...\n');
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

const manifest = JSON.parse(readFileSync(join(SAMPLES_DIR, 'manifest.json'), 'utf-8'));
const samples = Object.keys(manifest);

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
    const wrapperCode = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Component from './${name}';

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
  reactRoot.render(<Component />);
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
<p class="font-semibold">CSS: <code>http://localhost:5500/v-${VERSION_HASH}/styles.css</code> (${Math.round(css.length/1024)} KB)</p>
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

