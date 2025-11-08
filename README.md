# Auth0 ACUL Samples Tester

Local development tool for testing Auth0 Universal Login (ACUL) samples. Fetches official sample code from Auth0's GitHub repository, builds them into deployable assets, serves them locally, and deploys them to your Auth0 tenant for testing.

## What It Does

1. **Fetches** - Downloads sample screens from Auth0's official repository (JavaScript or React)
2. **Builds** - Compiles samples into production-ready CSS and JavaScript modules  
3. **Serves** - Hosts assets locally with CORS enabled for Auth0 integration
4. **Deploys** - Automatically configures your Auth0 tenant to use these local assets

Supports **81 JavaScript samples** or **76 React samples** including login, MFA, password reset, passkeys, WebAuthn, and all other Universal Login screens.

## Quick Start

```bash
# Install
npm install

# Configure Auth0 credentials (for deployment)
cp .env.example .env
# Edit .env: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET

# Fetch samples (JavaScript or React)
npm run fetch-samples        # Fetch all JavaScript samples
npm run fetch-samples:react  # Fetch all React samples

# Build and serve
npm run build                # Build samples into dist/
npm run serve                # Start local server

# Deploy to Auth0 tenant
npm run deploy               # Deploy all screens
npm run deploy:screen login  # Deploy specific screen
```

Server runs on `http://localhost:PORT` (default: 5500, configurable in `.env`)

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run fetch-samples` | Fetch all JavaScript samples (cleans previous) |
| `npm run fetch-samples:react` | Fetch all React samples (cleans previous) |
| `npm run build` | Build fetched samples into deployable assets |
| `npm run serve` | Build and start server (default port: 5500) |
| `npm run deploy` | Deploy all screens to Auth0 tenant |
| `npm run deploy:screen <name...>` | Deploy specific screen(s) |
| `npm run serve:stop` | Stop the running server |
| `npm run clean` | Remove built files and fetched samples |
| `npm run dev` | Full workflow: fetch + build + serve |

### Partial Fetching

Fetch specific samples by pattern:

```bash
node scripts/fetch-samples.js login        # Fetch all *login* samples
node scripts/fetch-samples.js login mfa    # Fetch login OR mfa samples  
node scripts/fetch-samples.js --react signup  # Fetch React signup samples
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```bash
# Auth0 Configuration (required for deployment)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_m2m_client_id
AUTH0_CLIENT_SECRET=your_m2m_client_secret

# Server Configuration (optional)
PORT=5500
```

### Auth0 Setup for Deployment

1. Go to **Auth0 Dashboard → Applications → Create Application**
2. Type: **Machine to Machine**
3. Authorize for: **Auth0 Management API**
4. Grant permissions: `read:prompts`, `update:prompts`
5. Copy Client ID and Client Secret to `.env`

## How It Works

### Fetch
Downloads markdown files from Auth0's GitHub repository at the version matching your installed package (`@auth0/auth0-acul-js` or `@auth0/auth0-acul-react`), extracts React/TypeScript code samples, and saves them to `src/samples/`.

### Build
- Compiles Tailwind CSS → `dist/v-{hash}/styles.css`
- Bundles React components with esbuild → `dist/v-{hash}/{screen}/component.js`
- Creates versioned build directory for cache busting

### Serve  
Static Express server with CORS enabled, serving assets from `dist/` on configured PORT.

### Deploy
Uses Auth0 Management API to configure each Universal Login screen with:
- CSS: `<link rel="stylesheet" href="http://localhost:{PORT}/v-{hash}/styles.css">`
- JS: `<script type="module" src="http://localhost:{PORT}/v-{hash}/{screen}/component.js"></script>`

## Project Structure

```
acul-tester/
├── scripts/
│   ├── fetch-samples.js     # Downloads samples from GitHub
│   ├── fix-samples.js       # Applies automatic fixes
│   ├── build-samples.js     # Builds CSS and JS modules
│   ├── serve.js             # Static file server
│   ├── deploy-to-auth0.js   # Deploys to Auth0 tenant
│   └── stop-server.js       # Stops running server
├── components/              # Mock components (tracked in git)
│   ├── Logo.tsx
│   └── Button.tsx
├── src/
│   ├── samples/             # Fetched samples (gitignored)
│   │   ├── components/      # Sample-specific mocks (tracked)
│   │   ├── *.tsx            # Fetched components
│   │   └── manifest.json
│   └── samples-styles.css   # Tailwind source
├── dist/                    # Built assets (gitignored)
│   └── v-{hash}/
│       ├── styles.css
│       └── {screen}/component.js
└── .env                     # Configuration (gitignored)
```

## Resources

- [Screen Mappings](./SCREEN_MAPPINGS.md) - Complete list of all 81 screens and their Auth0 API mappings
- [Implementation Details](./IMPLEMENTATION_SUMMARY.md) - Technical documentation and architecture
- [Auth0 Universal Login Docs](https://auth0.com/docs/customize/login-pages)
- [ACUL SDK Repository](https://github.com/auth0/universal-login)

## Notes

- Files in `src/samples/` and `dist/` are auto-generated - don't edit manually
- Samples are fetched from git tags matching your installed package version
- Keep server running while testing Auth0 login flows
- CSS is shared across all screens
- For local testing only - not for production use

## License

MIT

---

**All samples are from the official [Auth0 Universal Login Repository](https://github.com/auth0/universal-login)**
