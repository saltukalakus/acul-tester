# Auth0 ACUL Sample Assets Server

Automated system that fetches Auth0 ACUL (Advanced Customizable Universal Login) code samples from the official repository, builds them into JavaScript modules, and serves them locally for Auth0 tenant configuration.

## 🎯 Purpose

Build and serve **both CSS and JavaScript files** from localhost so you can configure your Auth0 Universal Login screens to use these samples for local development and testing.

## ⚡ Quick Start

👉 **[See QUICK_START.md for fastest setup](./QUICK_START.md)**

```bash
# 1. Install dependencies
npm install

# 2. Configure Auth0 credentials
cp .env.example .env
# Edit .env with your Auth0 domain, client ID, and secret

# 3. Build, serve, and deploy (all-in-one)
npm run serve  # Start server on localhost:5500
npm run deploy # Configure all Auth0 screens
```

Server will run on **http://localhost:5500**

## 📦 What You Get

### Built Assets

- **CSS File**: `http://localhost:5500/v-{hash}/styles.css` - Tailwind CSS compiled and minified
- **JavaScript Components**: `http://localhost:5500/v-{hash}/{screen}/component.js` - Compiled React modules
- **81 Sample Screens**: All Auth0 Universal Login screens including login variants, MFA (35+ screens), password reset flows, passkeys, WebAuthn, and more

### File Structure

```
dist/
├── .current-version             # Current version hash
├── .versions                    # Version history
└── v-{hash}/                    # Versioned build directory
    ├── styles.css               # ← Deployed to Auth0
    ├── index.html               # Server homepage
    ├── login/
    │   ├── component.tsx        # Source code
    │   ├── component.js         # ← Compiled module deployed to Auth0
    │   └── component.js.map     # Source map
    ├── signup/
    │   ├── component.tsx
    │   ├── component.js         # ← Deployed to Auth0
    │   └── component.js.map
    └── ... (79 more screens)
```

## 🚀 Automated Deployment

The deployment script automatically configures **all 20 Auth0 Universal Login screens** to load CSS and JavaScript from localhost:5500:

```bash
npm run deploy              # Deploy all screens
npm run deploy:screen login signup consent  # Deploy specific screens
```

### What Gets Deployed

For each screen, the script configures Auth0 to inject:
1. **CSS link**: `<link rel="stylesheet" href="http://localhost:5500/styles.css">`
2. **JS module**: `<script type="module" src="http://localhost:5500/{screen}/component.js"></script>`

## 🔄 Complete Workflow

### Example Source Options

Choose between two Auth0 example repositories:

**JavaScript Examples** (default - 81 screens, 75 working):
```bash
npm run build               # Uses auth0-acul-js examples
npm run fetch-samples       # Fetch JS examples only
```

**React Examples** (76 screens - requires `@auth0/auth0-acul-react` package):
```bash
# First, install the React package
npm install @auth0/auth0-acul-react

# Then build and deploy
npm run build:react         # Uses auth0-acul-react examples  
npm run deploy              # Deploy to Auth0

# Or fetch only
npm run fetch-samples:react # Fetch React examples only
```

**Build Success Rates**:
- JavaScript examples: 75/81 screens (93%) ✅ **Recommended**
- React examples: ~16/76 screens (21%) - Many require custom components

**Recommendation**: Use the JavaScript examples (default) as they have much better compatibility and don't require additional packages.

### 1. Fetch & Build

```bash
npm run build               # Default: JavaScript examples
# OR
npm run build:react         # React examples
```

This command:
- Fetches samples from the **installed package version's git tag** (ensures compatibility)
- Compiles Tailwind CSS → `dist/styles.css`
- Compiles React components → `dist/{screen}/component.js`
- Creates 81 JavaScript or 76 React ready-to-deploy screens

**Version Matching**: The script automatically fetches examples from the git tag matching your installed `@auth0/auth0-acul-js` or `@auth0/auth0-acul-react` version in `package.json`, ensuring the examples match the SDK APIs you're using.

### 2. Start Local Server

```bash
npm run serve
```

Serves built assets on http://localhost:5500 - **Keep this running!**

### 3. Deploy to Auth0 (Automated)

```bash
npm run deploy
```

This automatically configures all 20 Auth0 screens to load CSS and JavaScript from localhost:5500.

Or deploy specific screens:
```bash
npm run deploy:screen login signup consent
```

### 4. Test Your Login

Visit your application and trigger the login flow. Auth0 will now load:
- CSS from `http://localhost:5500/styles.css`
- JavaScript from `http://localhost:5500/{screen}/component.js`

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run fetch-samples` | Download latest samples from GitHub |
| `npm run build` | Fetch samples + build CSS & JS |
| `npm run serve` | Build and start server on port 5500 |
| `npm run deploy` | Configure all Auth0 screens automatically |
| `npm run deploy:screen <name>` | Configure specific screen(s) |
| `npm run clean` | Remove all built files |

## 🌐 Built Assets

Once built and served:

- **CSS**: `http://localhost:5500/styles.css`
- **JavaScript modules**: `http://localhost:5500/{screen}/component.js`
- **Source code**: `http://localhost:5500/{screen}/component.tsx`
- **Homepage**: `http://localhost:5500/`

### All 20 Screens

1. login
2. login-id  
3. login-password
4. signup
5. signup-id
6. signup-password
7. consent
8. device-code-confirmation
9. email-otp-challenge
10. email-verification-result
11. login-email-verification
12. logout
13. logout-complete
14. mfa-enroll-result
15. mfa-login-options
16. mfa-otp-enrollment-code
17. organization-picker
18. organization-selection
19. redeem-ticket
20. reset-password-request

## 📁 Project Structure

```
acul-tester/
├── scripts/
│   ├── fetch-samples.js     # Downloads samples from GitHub
│   ├── build-samples.js     # Builds CSS and copies components
│   └── serve.js             # Static file server
├── src/
│   ├── samples/             # Auto-generated (gitignored)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── ... (fetched components)
│   └── samples-styles.css   # Tailwind source
├── dist/                    # Built assets (gitignored)
│   ├── styles.css          # Built Tailwind CSS
│   └── <screen-name>/
│       └── component.tsx
└── package.json
```

## 🔄 How It Works

1. **Fetch**: Downloads markdown files from Auth0's GitHub repository
2. **Extract**: Pulls React/TailwindCSS code samples from markdown
3. **Build**: 
   - Compiles Tailwind CSS into single `styles.css`
   - Bundles React components with esbuild → `dist/<screen-name>/component.js`
   - Resolves imports using mock component structure
4. **Serve**: Static server on port 5500 with CORS enabled

### Mock Components Architecture

The samples reference components that don't exist in the Auth0 SDK packages. Rather than modifying the fetched samples, we provide mock components that match the import paths:

**Root-level components** (`components/`):
- `Logo.tsx` - Auth0 branding logo component
- `Button.tsx` - Primary action button component

**Sample-specific components** (`src/samples/components/`):
- `Title.tsx` - Screen title and description
- `FederatedLogin.tsx` - Social login buttons
- `Links.tsx` - Navigation links (login/signup)
- `ErrorMessages.tsx` - Error display component

This approach:
- ✅ Keeps sample code unchanged (matches Auth0's original structure)
- ✅ No need for fix-samples.js script
- ✅ Single mock file can fix dozens of samples
- ✅ Easy to extend with additional components
- ✅ Build process automatically resolves imports

## 📚 Available Screens

All 20 screens from Auth0 ACUL SDK:

- `login` - Basic login screen
- `login-id` - Login with identifier
- `login-password` - Password entry
- `signup` - User registration
- `signup-id` - Signup identifier
- `signup-password` - Signup password
- `consent` - OAuth consent
- `logout` - Logout confirmation
- `logout-complete` - Logout success
- `mfa-login-options` - MFA method selection
- `mfa-enroll-result` - MFA enrollment result
- `mfa-otp-enrollment-code` - OTP enrollment
- `email-otp-challenge` - Email OTP verification
- `email-verification-result` - Email verification status
- `login-email-verification` - Login email verification
- `device-code-confirmation` - Device code flow
- `organization-picker` - Organization selection
- `organization-selection` - Organization input
- `redeem-ticket` - Ticket redemption
- `reset-password-request` - Password reset

## 🔧 Configuration

### Change Port

Edit `scripts/serve.js`:

```javascript
const PORT = 5500;  // Change to your preferred port
```

### Update Samples

```bash
npm run fetch-samples  # Downloads latest from GitHub
npm run build          # Rebuilds everything
```

## 💡 Tips

1. **Keep server running** while testing Auth0 login flows
2. **CSS is shared** across all screens - one URL for everything
3. **Components are separate** - each screen has its own `.tsx` file
4. **Auto-updates** - Run `npm run build` to fetch latest samples
5. **CORS enabled** - Server allows requests from Auth0

## � Automated Deployment to Auth0

Instead of manually configuring each screen in the Auth0 Dashboard, you can use the automated deployment script to push all customizations at once.

### Setup for Deployment

#### 1. Create a Machine-to-Machine Application

1. Go to **Auth0 Dashboard → Applications → Applications**
2. Click **Create Application**
3. Name it "ACUL Deployment" and select **Machine to Machine**
4. Authorize it for **Auth0 Management API**
5. Grant permissions:
   - `read:prompts`
   - `update:prompts`

#### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_m2m_client_id
AUTH0_CLIENT_SECRET=your_m2m_client_secret
CSS_URL=http://localhost:5500/styles.css
```

#### 3. Deploy to Auth0

```bash
# Deploy all screens
npm run deploy

# Deploy specific screens only
npm run deploy:screen login login-id signup
```

### What the Deployment Script Does

1. ✅ Authenticates with Auth0 Management API using client credentials
2. ✅ Reads your built component files from `dist/`
3. ✅ Configures CSS URL for all screens
4. ✅ Updates each prompt rendering via PATCH API
5. ✅ Provides detailed deployment summary

### Example Output

```
🚀 Auth0 Deployment Starting...

Domain: your-tenant.auth0.com
CSS URL: http://localhost:5500/styles.css

🔐 Authenticating with Auth0...
✓ Authentication successful

📦 Found 20 screens to deploy

📝 Updating login/login...
  ✓ Updated successfully
📝 Updating login/login-id...
  ✓ Updated successfully
...

==================================================
📊 Deployment Summary:
  ✓ Success: 20
  ❌ Failed: 0
  📝 Total: 20
==================================================

✅ All screens deployed successfully!

💡 Your Auth0 tenant is now using:
   CSS: http://localhost:5500/styles.css
   Components: Deployed to Auth0
```

### Deployment Workflow

```bash
# 1. Make sure server is running for CSS
npm run serve

# 2. In another terminal, deploy
npm run deploy

# 3. Test your login flow
# Your Auth0 tenant now uses localhost CSS and deployed components
```

### Important Notes

- **CSS URL**: The script configures all screens to load CSS from the `CSS_URL` in your `.env`
- **Component Code**: Deployed directly to Auth0 (no need to host components)
- **Local Testing**: Set `CSS_URL=http://localhost:5500/styles.css` to test with local CSS
- **Production**: Update `CSS_URL` to your CDN URL when deploying to production

##  Resources

- [Auth0 Universal Login Docs](https://auth0.com/docs/customize/login-pages)
- [ACUL SDK Documentation](https://github.com/auth0/universal-login/tree/master/packages/auth0-acul-js)
- [Sample Source Code](https://github.com/auth0/universal-login/tree/master/packages/auth0-acul-js/examples)
- [Management API - Prompt Rendering](https://auth0.com/docs/api/management/v2/prompts/patch-rendering)
- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment script documentation
- [Setup Guide](./AUTH0_SETUP.md) - Step-by-step Auth0 configuration

## ⚠️ Important Notes

- Files in `src/samples/` and `dist/` are auto-generated - don't edit manually
- Samples are fetched fresh on each build
- Requires Node.js and npm
- For **local testing only** - not for production use

## 🤝 Credits

All samples are from the official [Auth0 Universal Login Repository](https://github.com/auth0/universal-login)

---

**Built for local Auth0 Universal Login testing** 🔐

Automated build system that fetches Auth0 ACUL (Advanced Customizable Universal Login) code samples directly from the [official repository](https://github.com/auth0/universal-login) and builds them for local testing.

## Features

✨ **Automated Sample Fetching** - Downloads latest samples from GitHub during build  
🎨 **TailwindCSS Styling** - All samples include full TailwindCSS implementations  
⚛️ **React Components** - Complete React/TypeScript components  
🚀 **Local Development Server** - Test samples on localhost:5500  
📦 **Vite Build System** - Fast builds and hot module replacement

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Fetch Samples and Start Development Server

```bash
npm run dev
```

This will:
- Fetch the latest code samples from the Auth0 repository
- Start the Vite development server on http://localhost:5500
- Open the browser automatically

### 3. Build for Production

```bash
npm run build
```

This will:
- Fetch the latest samples
- Build optimized CSS and JS files
- Output to the `dist/` directory

### 4. Preview Production Build

```bash
npm run preview
```

Serves the production build on http://localhost:5500

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run fetch-samples` | Download latest samples from GitHub |
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run serve` | Build and preview in one command |

## How It Works

### Automated Sample Fetching

The `scripts/fetch-samples.js` script:

1. **Fetches Markdown Files** - Downloads example files from the Auth0 repository
2. **Extracts Code Blocks** - Parses markdown and extracts React/TailwindCSS code samples
3. **Generates Components** - Converts samples into complete TypeScript components
4. **Creates Manifest** - Generates a manifest.json with metadata about all samples
5. **Builds Index** - Creates an index.ts that exports all components

### Build Process

1. **Pre-build**: Fetch latest samples from GitHub
2. **Process**: Vite bundles React components and processes TailwindCSS
3. **Output**: Optimized static files ready for hosting

## Project Structure

```
acul-tester/
├── scripts/
│   └── fetch-samples.js      # Automated sample fetcher
├── src/
│   ├── samples/              # Auto-generated (gitignored)
│   │   ├── *.tsx            # Fetched component files
│   │   ├── index.ts         # Component exports
│   │   └── manifest.json    # Sample metadata
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── dist/                     # Build output (gitignored)
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # TailwindCSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json
└── README.md
```

## Available Samples

The following screens are automatically fetched from the Auth0 repository:

- login
- login-id
- login-password
- signup
- signup-id
- signup-password
- consent
- device-code-confirmation
- email-otp-challenge
- email-verification-result
- login-email-verification
- logout
- logout-complete
- mfa-enroll-result
- mfa-login-options
- mfa-otp-enrollment-code
- organization-picker
- organization-selection
- redeem-ticket
- reset-password-request

## Local Development

### Port Configuration

The development server runs on port 5500 by default. To change this, edit `vite.config.js`:

```javascript
server: {
  port: 5500,  // Change to your preferred port
  open: true
}
```

### Updating Samples

To get the latest samples from the Auth0 repository:

```bash
npm run fetch-samples
```

This is automatically run during `npm run dev` and `npm run build`.

## Notes

- The `src/samples/` directory is auto-generated and gitignored
- Samples are fetched fresh on each build to ensure you have the latest code
- All samples use TailwindCSS for styling
- Components are TypeScript/TSX format

## Resources

- [Auth0 Universal Login Repository](https://github.com/auth0/universal-login)
- [Auth0 ACUL JS Documentation](https://github.com/auth0/universal-login/tree/master/packages/auth0-acul-js)
- [Auth0 ACUL Examples](https://github.com/auth0/universal-login/tree/master/packages/auth0-acul-js/examples)

## License

MIT
Acul Tester
