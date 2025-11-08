# 🚀 Auth0 Deployment Script Guide

## Overview

The deployment script (`scripts/deploy-to-auth0.js`) automatically configures your Auth0 tenant's Universal Login screens using the Management API.

## What It Does

1. ✅ Authenticates with Auth0 using Machine-to-Machine credentials
2. ✅ Reads component files from `dist/`
3. ✅ Configures CSS URL via `<link>` tag in head
4. ✅ Deploys React component code to each screen
5. ✅ Uses correct prompt/screen mappings per Auth0 API

## Prerequisites

### 1. Machine-to-Machine Application

Create in Auth0 Dashboard:
- **Applications → Create Application**
- Type: **Machine to Machine**
- Authorize: **Auth0 Management API**
- Permissions:
  - `read:prompts`
  - `update:prompts`

### 2. Environment Configuration

```bash
# .env file
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_m2m_client_id
AUTH0_CLIENT_SECRET=your_m2m_client_secret
CSS_URL=http://localhost:5500/styles.css
```

## Usage

### Deploy All Screens

```bash
npm run deploy
```

This will:
- Build all samples from GitHub (81 screens)
- Deploy all available screens to Auth0
- Configure CSS URL for each

### Deploy Specific Screens

```bash
npm run deploy:screen login signup
npm run deploy:screen mfa-login-options consent
```

## How It Works

### 1. Authentication

```javascript
POST https://{domain}/oauth/token
{
  "grant_type": "client_credentials",
  "client_id": "{client_id}",
  "client_secret": "{client_secret}",
  "audience": "https://{domain}/api/v2/"
}
```

Returns Management API token with scoped permissions.

### 2. Prompt Rendering Update

For each screen, the script calls:

```javascript
PATCH https://{domain}/api/v2/prompts/{prompt}/screen/{screen}/rendering
{
  "rendering_mode": "advanced",
  "head_tags": [
    {
      "tag": "link",
      "attributes": {
        "rel": "stylesheet",
        "href": "http://localhost:5500/styles.css"
      }
    }
  ]
}
```

**Note**: The actual API uses `PATCH` method with `/screen/` in the path, not `PUT` with `/renderings/`.

### 3. Screen to Prompt Mapping

The script maps screen names to Auth0 prompt types. Here are the main mappings:

| Screen | Prompt Type |
|--------|-------------|
| `login`, `login-id`, `login-password`, `login-email-verification`, `login-passwordless-*` | `login` |
| `signup`, `signup-id`, `signup-password` | `signup` |
| `mfa-*` (35+ screens) | `mfa` |
| `consent`, `customized-consent` | `consent` |
| `device-code-*` | `device-code-confirmation` |
| `email-*` | `email-verification` |
| `organization-picker`, `organization-selection` | `organization` |
| `reset-password-*` (15+ screens) | `reset-password` |
| `logout`, `logout-complete`, `logout-aborted` | `logout` |
| `redeem-ticket`, `accept-invitation` | `redeem-ticket` |
| `passkey-*`, `phone-identifier-*` | Various |

**Total: 81 screens** covering all Auth0 Universal Login flows.

## Error Handling

### Common Errors

#### 1. Authentication Failed

```
❌ Failed to get token: 401
```

**Fix**: Check your Client ID and Client Secret in `.env`

#### 2. Insufficient Permissions

```
❌ Failed to update login/login-id: 403
```

**Fix**: Grant `read:prompts` and `update:prompts` to your M2M app

#### 3. Screen Not Found

```
❌ Screen 'xyz' not found in dist/
```

**Fix**: Run `npm run build` first to build all components

#### 4. Rate Limiting

The script includes 500ms delays between requests to avoid rate limits.

## Example Output

```bash
$ npm run deploy

🚀 Auth0 Deployment Starting...

Domain: dev-abc123.auth0.com
CSS URL: http://localhost:5500/styles.css

🔐 Authenticating with Auth0...
✓ Authentication successful

📦 Found 81 screens to deploy

📝 Updating login/login...
  ✓ Updated successfully
📝 Updating login/login-id...
  ✓ Updated successfully
📝 Updating login/login-password...
  ✓ Updated successfully
📝 Updating signup/signup...
  ✓ Updated successfully
📝 Updating signup/signup-id...
  ✓ Updated successfully
...

==================================================
📊 Deployment Summary:
  ✓ Success: 72
  ⚠️  Skipped: 9 (missing dependencies)
  ❌ Failed: 0
  📝 Total: 81
==================================================

✅ All available screens deployed successfully!

💡 Your Auth0 tenant is now using:
   CSS: http://localhost:5500/styles.css
   Components: Deployed to Auth0
```

## Deployment Flow

```
┌─────────────────┐
│  npm run deploy │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  npm run build      │  ← Fetch latest from GitHub
│  (fetch + compile)  │  ← Build CSS & components
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Get M2M Token       │  ← Client credentials grant
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ For each screen:    │
│  - Read component   │
│  - Map to prompt    │
│  - PATCH API        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Summary Report      │
└─────────────────────┘
```

## Local vs Production

### Local Testing

```bash
# .env
CSS_URL=http://localhost:5500/styles.css

# Start server
npm run serve

# Deploy
npm run deploy
```

Your Auth0 login will load CSS from localhost.

### Production

```bash
# .env
CSS_URL=https://cdn.example.com/auth0/styles.css

# Upload CSS to CDN
# Then deploy
npm run deploy
```

Auth0 loads CSS from your CDN.

## API Reference

### Auth0 Management API v2

- **Endpoint**: `/api/v2/prompts/{prompt}/screen/{screen}/rendering`
- **Method**: `PATCH`
- **Auth**: Bearer token (Management API)
- **Docs**: https://auth0.com/docs/api/management/v2

### Request Body Schema

```typescript
{
  head_tags?: Array<{
    tag: string;
    attributes: Record<string, string>;
  }>;
  page_content?: string;
}
```

### Valid Prompts

- `login`
- `signup`
- `mfa`
- `consent`
- `device-code-confirmation`
- `email-verification`
- `organization`
- `reset-password`
- `logout`
- `redeem-ticket`

## Troubleshooting

### Script Won't Run

```bash
# Make sure dependencies are installed
npm install

# Check Node.js version (needs v18+)
node --version
```

### Components Not Deploying

```bash
# Rebuild first
npm run build

# Check dist/ has files
ls -la dist/

# Then deploy
npm run deploy
```

### CSS Not Loading in Auth0

1. Make sure server is running: `npm run serve`
2. Check CORS is enabled in `scripts/serve.js`
3. Verify CSS URL in `.env`
4. Test URL directly: `http://localhost:5500/styles.css`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Auth0

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Deploy to Auth0
        env:
          AUTH0_DOMAIN: ${{ secrets.AUTH0_DOMAIN }}
          AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
          AUTH0_CLIENT_SECRET: ${{ secrets.AUTH0_CLIENT_SECRET }}
          CSS_URL: https://cdn.example.com/auth0/styles.css
        run: npm run deploy
```

### Environment Variables in CI

Set as repository secrets:
- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`

## Best Practices

1. ✅ **Test locally first** - Use `npm run serve` + manual config
2. ✅ **Version control** - Commit `.env.example`, not `.env`
3. ✅ **Use M2M app** - Don't use your main application credentials
4. ✅ **Limit permissions** - Only grant `read:prompts` and `update:prompts`
5. ✅ **Rotate secrets** - Periodically rotate M2M credentials
6. ✅ **Monitor deployments** - Check Auth0 logs after deployment
7. ✅ **Use production CSS** - Don't deploy with localhost URLs to prod

## Security Notes

- 🔒 Never commit `.env` file
- 🔒 Use separate M2M apps for dev/staging/prod
- 🔒 Rotate credentials regularly
- 🔒 Limit M2M app permissions to minimum required
- 🔒 Use HTTPS URLs for production CSS

---

**Happy Deploying!** 🚀
