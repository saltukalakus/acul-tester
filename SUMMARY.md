# Auth0 ACUL Tester - Complete Solution

## What This Project Does

This project provides a **complete automated workflow** for Auth0 Advanced Customizable Universal Login (ACUL) development:

### 1. Fetches Official Samples
Downloads the latest 20 ACUL screen examples from Auth0's GitHub repository.

### 2. Builds Production Assets
- **CSS**: Compiles Tailwind CSS into a single minified stylesheet
- **JavaScript**: Compiles React/TypeScript components into ES modules using esbuild

### 3. Serves Locally
Runs an Express server on `localhost:5500` serving all built assets.

### 4. Deploys to Auth0
Automatically configures all 20 Universal Login screens via Auth0 Management API to load:
- `<link rel="stylesheet" href="http://localhost:5500/styles.css">`
- `<script type="module" src="http://localhost:5500/{screen}/component.js"></script>`

## Complete Workflow

```bash
# One-time setup
npm install
cp .env.example .env  # Add Auth0 credentials

# Development workflow
npm run serve   # Builds everything and starts server
npm run deploy  # Configures Auth0 to use localhost:5500

# Now test your login! Auth0 loads CSS and JS from your local machine
```

## What Gets Built

```
dist/
├── styles.css                                    # Tailwind CSS (minified)
├── login/
│   ├── component.tsx                            # Source code
│   ├── component.js                             # Compiled module
│   └── component.js.map                         # Source map
├── login-id/
│   ├── component.tsx
│   ├── component.js
│   └── component.js.map
... (18 more screens)
```

## What Gets Deployed to Auth0

For each of the 20 screens, the deployment script uses the Management API to PATCH:

```
PATCH /api/v2/prompts/{prompt}/screen/{screen}/rendering
{
  "rendering_mode": "advanced",
  "head_tags": [
    {
      "tag": "link",
      "attributes": {
        "rel": "stylesheet",
        "href": "http://localhost:5500/styles.css"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "http://localhost:5500/{screen}/component.js",
        "type": "module"
      }
    }
  ]
}
```

## All 20 Deployed Screens

| Screen | Prompt | Description |
|--------|--------|-------------|
| login | login | Main login screen |
| login-id | login-id | Identifier-first login |
| login-password | login-password | Password entry |
| signup | signup | Main signup screen |
| signup-id | signup-id | Identifier collection |
| signup-password | signup-password | Password creation |
| consent | consent | User consent screen |
| device-code-confirmation | device-flow | Device authorization |
| email-otp-challenge | email-otp-challenge | Email OTP verification |
| email-verification-result | email-verification | Email verification result |
| login-email-verification | login-email-verification | Login email verification |
| logout | logout | Logout screen |
| logout-complete | logout | Logout completion |
| mfa-enroll-result | mfa | MFA enrollment result |
| mfa-login-options | mfa | MFA method selection |
| mfa-otp-enrollment-code | mfa-otp | MFA OTP enrollment |
| organization-picker | organizations | Organization selection |
| organization-selection | organizations | Organization confirmation |
| redeem-ticket | common | Ticket redemption |
| reset-password-request | reset-password | Password reset request |

## Key Features

✅ **Automated sample fetching** from Auth0 GitHub  
✅ **TypeScript/React → JavaScript compilation** with esbuild  
✅ **Tailwind CSS compilation** with autoprefixer  
✅ **Local development server** on port 5500  
✅ **One-command Auth0 deployment** via Management API  
✅ **OAuth 2.0 authentication** with client credentials  
✅ **Correct prompt/screen mappings** for all 20 screens  
✅ **Live reload capability** - just restart server to see changes  

## Development Benefits

- **Rapid iteration**: Edit CSS/components, rebuild, and test immediately
- **No manual Dashboard configuration**: Automated deployment to all screens
- **Source control friendly**: All customizations in code
- **Production-ready build process**: Minified CSS, compiled JS, source maps
- **Type safety**: TypeScript support for components

## Next Steps

1. Make changes to CSS or components
2. Run `npm run build` to rebuild
3. Changes automatically served on localhost:5500
4. Auth0 loads updated assets on next login

For production deployment, simply:
1. Deploy assets to CDN (S3, CloudFront, etc.)
2. Update `.env` with production CSS_URL
3. Run `npm run deploy` to update Auth0
