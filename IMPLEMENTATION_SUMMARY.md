# Auth0 ACUL Samples Tester - Technical Implementation

Complete technical documentation covering architecture, implementation details, and workflows.

## Overview

Automated system for fetching, building, serving, and deploying Auth0 Universal Login (ACUL) samples. Supports both JavaScript and React samples with version-matched fetching, automated fixes, mock component architecture, and Auth0 Management API integration.

## Architecture

### Core Components

1. **Fetch System** (`scripts/fetch-samples.js`)
   - Downloads samples from Auth0 GitHub repository
   - Version-matched fetching (uses git tags matching installed package version)
   - Pattern-based filtering for partial fetching
   - Automatic sample extraction from markdown files

2. **Fix System** (`scripts/fix-samples.js`)
   - Applies automated fixes to known sample issues
   - Currently fixes: typos in imports, placeholder screens

3. **Build System** (`scripts/build-samples.js`)
   - esbuild-based compilation
   - React 18 with `createRoot`
   - Named/default export detection
   - Versioned output with cache busting
   - Source map generation

4. **Serve System** (`scripts/serve.js`)
   - Express static server
   - CORS enabled for Auth0 integration
   - Configurable PORT via environment
   - Build version tracking

5. **Deploy System** (`scripts/deploy-to-auth0.js`)
   - Auth0 Management API integration
   - OAuth 2.0 Client Credentials authentication
   - Bulk and selective deployment
   - Only deploys screens that exist in `src/samples/`

6. **Mock Components** (`components/`, `src/samples/components/`)
   - Provides missing SDK components
   - Enables builds without modifying fetched samples
   - Git-tracked for consistency

### File Structure

```
acul-tester/
├── scripts/
│   ├── fetch-samples.js      # Sample fetcher with GitHub API
│   ├── fix-samples.js        # Automated fixes
│   ├── build-samples.js      # esbuild compilation
│   ├── serve.js              # Express server
│   ├── deploy-to-auth0.js    # Management API deployment
│   └── stop-server.js        # Server shutdown
├── components/               # Root mock components (git-tracked)
│   ├── Logo.tsx
│   └── Button.tsx
├── src/
│   ├── samples/              # Fetched samples (gitignored except components/)
│   │   ├── components/       # Sample-specific mocks (git-tracked)
│   │   │   ├── Title.tsx
│   │   │   ├── FederatedLogin.tsx
│   │   │   ├── Links.tsx
│   │   │   └── ErrorMessages.tsx
│   │   ├── *.tsx             # Fetched screens
│   │   ├── *.wrapper.tsx     # Build wrappers
│   │   ├── index.ts          # Exports
│   │   └── manifest.json     # Metadata
│   └── samples-styles.css    # Tailwind source
├── dist/                     # Build output (gitignored)
│   ├── .current-version      # Active version hash
│   ├── .versions             # Version history
│   └── v-{hash}/             # Versioned build
│       ├── styles.css        # Compiled Tailwind
│       ├── index.html        # Server homepage
│       └── {screen}/
│           ├── component.tsx # Source code
│           ├── component.js  # Compiled module
│           └── component.js.map
└── .env                      # Configuration (gitignored)
```

## Fetch System

### Version-Matched Fetching

```javascript
// Reads package.json to get installed version
const version = packageJson.dependencies['@auth0/auth0-acul-js'];
const GIT_TAG = `auth0-acul-js@${version}`;

// Fetches from git tag instead of master
const GITHUB_API_BASE = `https://api.github.com/repos/auth0/universal-login/contents/packages/auth0-acul-js/examples?ref=${GIT_TAG}`;
```

**Benefits:**
- Examples match SDK APIs exactly
- No version mismatch errors
- Predictable, reproducible builds

### Pattern-Based Filtering

```bash
# Fetch all samples
npm run fetch-samples

# Fetch specific patterns
node scripts/fetch-samples.js login        # All *login* samples
node scripts/fetch-samples.js login mfa    # login OR mfa samples
node scripts/fetch-samples.js --react signup  # React signup samples
```

**Implementation:**
```javascript
const patterns = args.filter(arg => !arg.startsWith('-'));
mdFiles = mdFiles.filter(filename => 
  patterns.some(pattern => filename.toLowerCase().includes(pattern.toLowerCase()))
);
```

### Clean Fetch Behavior

Every fetch automatically runs `npm run clean` to:
- Remove `src/samples/` directory
- Remove `dist/` directory  
- Ensure fresh state

## Build System

### Export Detection

Automatically detects named vs default exports:

```javascript
const hasNamedExport = /export const \w+: React\.FC/.test(sampleContent);
const componentName = hasNamedExport 
  ? sampleContent.match(/export const (\w+): React\.FC/)?.[1] 
  : 'Component';
```

### Wrapper Generation

Creates wrapper files for each component:

```javascript
const wrapperCode = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ${componentName} } from './${name}';

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponent);
} else {
  initComponent();
}

function initComponent() {
  const container = document.getElementById('auth0-acul-root') || 
    document.body.appendChild(document.createElement('div'));
  container.id = 'auth0-acul-root';
  
  const reactRoot = createRoot(container);
  reactRoot.render(<${componentName} />);
}
`;
```

### esbuild Configuration

```javascript
await esbuild.build({
  entryPoints: [wrapperPath],
  bundle: true,
  format: 'esm',
  outfile: join(dir, 'component.js'),
  jsx: 'automatic',
  platform: 'browser',
  target: ['es2022'],
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  minify: false,
  sourcemap: true,
  logLevel: 'silent'
});
```

### Versioning

Each build creates a unique versioned directory:

```javascript
const VERSION_HASH = crypto.randomBytes(8).toString('hex');
const OUTPUT_DIR = join(DIST_DIR, `v-${VERSION_HASH}`);
```

Benefits:
- Cache busting
- Multiple versions can coexist
- Rollback capability

## Mock Components Architecture

### Problem
Auth0 sample code imports components that don't exist in published packages:
```typescript
import { Logo } from '@auth0/auth0-acul-react/components/Logo';
import { Title } from '../components/Title';
```

### Solution
Provide mock implementations without modifying fetched samples:

**Root-level** (`components/`):
- `Logo.tsx` - Auth0 branding
- `Button.tsx` - Primary buttons

**Sample-level** (`src/samples/components/`):
- `Title.tsx` - Screen titles
- `FederatedLogin.tsx` - Social login
- `Links.tsx` - Navigation links
- `ErrorMessages.tsx` - Error display

### Benefits
- ✅ Samples remain unchanged (match Auth0 originals)
- ✅ Single mock fixes multiple samples
- ✅ Easy to extend
- ✅ Git-tracked for consistency

## Serve System

### Express Server

```javascript
const app = express();
const PORT = parseInt(process.env.PORT || '5500', 10);

// CORS for Auth0
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Static files
app.use(express.static(DIST_DIR));

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
```

### Configurable PORT

Set via `.env`:
```bash
PORT=3000  # Custom port
```

Used across all scripts:
- `build-samples.js` - HTML generation
- `serve.js` - Server binding
- `deploy-to-auth0.js` - BASE_URL construction
- `stop-server.js` - Process termination
- `vite.config.js` - Dev server

## Deploy System

### Authentication Flow

```
1. Load credentials from .env
2. POST to /oauth/token with client_credentials
3. Receive Management API access token
4. Use token in Authorization header for PATCH requests
```

### Management API Integration

**Endpoint:**
```
PATCH https://{domain}/api/v2/prompts/{prompt}/screen/{screen}/rendering
```

**Request Body:**
```json
{
  "rendering_mode": "advanced",
  "head_tags": [
    {
      "tag": "link",
      "attributes": {
        "rel": "stylesheet",
        "href": "http://localhost:5500/v-{hash}/styles.css"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "http://localhost:5500/v-{hash}/{screen}/component.js",
        "type": "module"
      }
    }
  ]
}
```

### Screen Discovery

Only deploys screens that exist in `src/samples/`:

```javascript
function getAvailableScreens() {
  const files = readdirSync(SAMPLES_DIR);
  return files
    .filter(file => file.endsWith('.tsx'))
    .filter(file => !file.includes('.wrapper.'))
    .map(file => file.replace('.tsx', ''));
}
```

Works for both JS and React samples automatically.

### Screen to Prompt Mapping

Complete mapping of 81 screens to Auth0 prompt/screen combinations:

```javascript
const PROMPT_SCREEN_MAP = {
  'login': { prompt: 'login', screen: 'login' },
  'login-id': { prompt: 'login-id', screen: 'login-id' },
  'mfa-otp-challenge': { prompt: 'mfa-otp', screen: 'mfa-otp-challenge' },
  // ... 78 more mappings
};
```

See [SCREEN_MAPPINGS.md](./SCREEN_MAPPINGS.md) for complete list.

### Rate Limiting

500ms delay between API calls to avoid rate limits:

```javascript
await new Promise(resolve => setTimeout(resolve, 500));
```

### Error Handling

- Environment variable validation
- API authentication failures
- Individual screen deployment errors
- File existence checks
- Network error recovery
- Comprehensive error reporting

## Sample Fixes

### Automated Fixes

Applied by `scripts/fix-samples.js` after fetching:

1. **Typo Fix: interstitial-captcha**
   ```javascript
   // Before: import { interstitialCaptcha } from '@auth0/auth0-acul-react';
   // After:  import { InterstitialCaptcha } from '@auth0/auth0-acul-react';
   ```

2. **Placeholder Screens**
   - `get-current-screen-options`
   - `get-current-theme-options`
   - Converted to placeholder screens (helper functions, not renderable)

### Known Issues (Not Fixed)

**getActiveIdentifiers() in JavaScript samples:**
- Renamed to `getLoginIdentifiers()` in auth0-acul-js@1.0.0-alpha.2
- Upstream examples still use old name
- Will be fixed in next Auth0 release
- We don't fix (correct API, temporarily broken in alpha.2)

## Build Success Rates

### JavaScript Samples (auth0-acul-js@1.0.0-alpha.2)
- **Total:** 81 screens
- **Built:** 78 screens
- **Success Rate:** 96%
- **Failures:** 3 screens (getActiveIdentifiers API issue)

### React Samples (auth0-acul-react@1.0.0-alpha.2)
- **Total:** 76 screens  
- **Built:** 76 screens
- **Success Rate:** 100%
- **Failures:** 0 screens

## Package Dependencies

### Production
```json
{
  "@auth0/auth0-acul-js": "^1.0.0-alpha.2",
  "@auth0/auth0-acul-react": "^1.0.0-alpha.2",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Development
```json
{
  "esbuild": "^0.19.12",
  "express": "^4.21.2",
  "dotenv": "^16.6.1",
  "tailwindcss": "^3.3.2",
  "autoprefixer": "^10.4.14",
  "postcss": "^8.4.24",
  "typescript": "^5.0.2"
}
```

## Environment Variables

```bash
# Auth0 Configuration (required for deployment)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_m2m_client_id
AUTH0_CLIENT_SECRET=your_m2m_client_secret

# Server Configuration (optional)
PORT=5500  # Default: 5500
```

## NPM Scripts

```json
{
  "clean": "rm -rf dist src/samples/*.tsx src/samples/*.ts src/samples/*.json",
  "fetch-samples": "npm run clean && node scripts/fetch-samples.js && node scripts/fix-samples.js",
  "fetch-samples:react": "npm run clean && node scripts/fetch-samples.js --react && node scripts/fix-samples.js",
  "build": "node scripts/build-samples.js",
  "deploy": "npm run build && node scripts/deploy-to-auth0.js",
  "serve": "npm run deploy && node scripts/serve.js",
  "serve:stop": "node scripts/stop-server.js",
  "dev": "npm run fetch-samples && npm run build && node scripts/serve.js"
}
```

## Workflows

### Full Development Workflow

```bash
# 1. Fetch samples
npm run fetch-samples        # or fetch-samples:react

# 2. Build
npm run build

# 3. Serve locally
npm run serve

# 4. Deploy to Auth0
npm run deploy

# 5. Test login flow
# Visit your application and trigger login

# 6. Stop server when done
npm run serve:stop
```

### Rapid Iteration Workflow

```bash
# Fetch once
npm run fetch-samples

# Build multiple times (e.g., CSS changes)
npm run build
npm run build
npm run build

# No need to re-fetch
```

### Pattern-Based Workflow

```bash
# Work on login screens only
node scripts/fetch-samples.js login
npm run build
npm run deploy:screen login login-id login-password

# Work on MFA screens
node scripts/fetch-samples.js mfa
npm run build
npm run deploy:screen mfa-login-options mfa-otp-challenge
```

## Security Considerations

✅ Environment variables for credentials (not hardcoded)  
✅ `.env` file excluded from git  
✅ M2M application with minimal permissions (`read:prompts`, `update:prompts`)  
✅ Separate credentials recommended for dev/staging/prod  
✅ Credentials validation before API calls  
✅ Secure token handling (never logged)  
✅ CORS enabled only for localhost serving  

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Auth0 Samples

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run fetch-samples
      - run: npm run build
      - run: npm run deploy
        env:
          AUTH0_DOMAIN: ${{ secrets.AUTH0_DOMAIN }}
          AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
          AUTH0_CLIENT_SECRET: ${{ secrets.AUTH0_CLIENT_SECRET }}
```

## Performance

### Fetch Performance
- **JavaScript samples:** ~10 seconds (81 files)
- **React samples:** ~8 seconds (76 files)
- **Pattern filtered:** ~2-5 seconds (varies by pattern)

### Build Performance
- **JavaScript samples:** ~3-5 seconds
- **React samples:** ~3-5 seconds
- **Incremental builds:** Not supported (full rebuild)

### Deploy Performance
- **All screens:** ~90 seconds (81 screens × 500ms delay + API time)
- **Specific screens:** ~2-5 seconds per screen

## Troubleshooting

### Build Failures

**Issue:** Component build fails  
**Solution:** Check if mock components exist in `components/` and `src/samples/components/`

**Issue:** getActiveIdentifiers errors in JS samples  
**Solution:** Known issue in alpha.2, will be fixed in next release

### Deployment Failures

**Issue:** 401 Unauthorized  
**Solution:** Check AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET in `.env`

**Issue:** 403 Forbidden  
**Solution:** Ensure M2M app has `read:prompts` and `update:prompts` permissions

**Issue:** 404 Not Found  
**Solution:** Screen/prompt combination doesn't exist in Auth0 (check SCREEN_MAPPINGS.md)

### Server Issues

**Issue:** Port already in use  
**Solution:** Run `npm run serve:stop` or change PORT in `.env`

**Issue:** CORS errors  
**Solution:** Ensure server is running and Auth0 can reach localhost (use ngrok for cloud tenants)

## Future Enhancements

Potential improvements:

- [ ] Watch mode for automatic rebuild
- [ ] CDN deployment support
- [ ] Production build with minification
- [ ] Multiple tenant support
- [ ] Deployment rollback capability
- [ ] Build caching for faster rebuilds
- [ ] Custom component library support

## References

- [Auth0 Universal Login Docs](https://auth0.com/docs/customize/login-pages)
- [ACUL SDK Repository](https://github.com/auth0/universal-login)
- [Management API - Prompt Rendering](https://auth0.com/docs/api/management/v2/prompts)
- [Screen Mappings](./SCREEN_MAPPINGS.md)

---

**Last Updated:** November 8, 2025  
**Package Versions:** auth0-acul-js@1.0.0-alpha.2, auth0-acul-react@1.0.0-alpha.2
