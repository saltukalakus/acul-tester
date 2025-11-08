# ⚡ Quick Start Guide

## 1. Install

\`\`\`bash
npm install
\`\`\`

## 2. Test Locally

```bash
# Fetch samples first
npm run fetch-samples

# Build and start server
npm run serve

# Server runs on http://localhost:5500 (default, configurable in .env)
# CSS: http://localhost:5500/v-{hash}/styles.css
```

**Tip**: Use `npm run dev` to fetch + build + serve in one command.
\`\`\`

## 3. Deploy to Auth0 (Recommended)

### Setup

\`\`\`bash
# Copy example env file
cp .env.example .env

# Edit .env with your Auth0 credentials:
# - AUTH0_DOMAIN=your-tenant.auth0.com
# - AUTH0_CLIENT_ID=your_m2m_client_id  
# - AUTH0_CLIENT_SECRET=your_m2m_client_secret
# - PORT=5500 (optional, defaults to 5500)
# - CSS_URL=http://localhost:5500/styles.css (optional)
```
\`\`\`

### Create M2M Application

1. **Auth0 Dashboard → Applications → Create Application**
2. Name: "ACUL Deployment"
3. Type: **Machine to Machine**
4. Authorize: **Auth0 Management API**
5. Permissions: \`read:prompts\`, \`update:prompts\`

### Deploy

\`\`\`bash
# Make sure server is running (for CSS)
npm run serve

# In another terminal, deploy all screens
npm run deploy
\`\`\`

Done! Your Auth0 tenant now uses:
- ✅ CSS from localhost
- ✅ Components deployed to Auth0

## 4. Manual Configuration (Alternative)

If you prefer manual setup:

1. **Start server**: `npm run serve`
2. **Auth0 Dashboard → Branding → Universal Login → Advanced**
3. **For each screen**:
   - CSS URL: `http://localhost:{PORT}/styles.css` (use your configured PORT from .env)
   - Component: Copy from `http://localhost:{PORT}/<screen>/component.tsx`

## Commands

\`\`\`bash
npm run clean                      # Remove built files and samples
npm run fetch-samples              # Fetch all JavaScript samples
npm run fetch-samples:react        # Fetch all React samples
node scripts/fetch-samples.js login  # Fetch only login-related samples
npm run build                      # Build fetched samples
npm run serve                      # Build + start server
npm run deploy                     # Deploy all screens to Auth0
\`\`\`

**Workflow**:
1. Fetch samples once: `npm run fetch-samples`
2. Build and serve: `npm run serve`
3. Deploy to Auth0: `npm run deploy`

## Next Steps

- 📖 [Full README](./README.md) - Complete documentation
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment docs
- 🔧 [Auth0 Setup](./AUTH0_SETUP.md) - Configuration walkthrough

## Support

- Check logs for errors
- Verify .env credentials
- Test CSS URL: `curl http://localhost:{PORT}/styles.css` (use your configured PORT)
- Run `npm run build` if components missing

---

**Built for Auth0 Universal Login testing** 🔐
