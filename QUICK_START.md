# ⚡ Quick Start Guide

## 1. Install

\`\`\`bash
npm install
\`\`\`

## 2. Test Locally

\`\`\`bash
# Start server
npm run serve

# Server runs on http://localhost:5500
# CSS: http://localhost:5500/styles.css
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
# - CSS_URL=http://localhost:5500/styles.css
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

1. **Start server**: \`npm run serve\`
2. **Auth0 Dashboard → Branding → Universal Login → Advanced**
3. **For each screen**:
   - CSS URL: \`http://localhost:5500/styles.css\`
   - Component: Copy from \`http://localhost:5500/<screen>/component.tsx\`

## Commands

\`\`\`bash
npm run serve              # Build + start server
npm run deploy             # Deploy all screens to Auth0
npm run deploy:screen login signup  # Deploy specific screens
npm run build              # Build without serving
npm run clean              # Remove built files
\`\`\`

## Next Steps

- 📖 [Full README](./README.md) - Complete documentation
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment docs
- 🔧 [Auth0 Setup](./AUTH0_SETUP.md) - Configuration walkthrough

## Support

- Check logs for errors
- Verify .env credentials
- Test CSS URL: \`curl http://localhost:5500/styles.css\`
- Run \`npm run build\` if components missing

---

**Built for Auth0 Universal Login testing** 🔐
