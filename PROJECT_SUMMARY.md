# Project Files Summary

## Documentation
- **README.md** - Complete project documentation
- **QUICK_START.md** - Fastest way to get started (⭐ START HERE)
- **DEPLOYMENT.md** - Detailed deployment script guide
- **AUTH0_SETUP.md** - Manual and automated configuration walkthrough
- **.env.example** - Environment configuration template

## Scripts
- `scripts/fetch-samples.js` - Downloads samples from GitHub
- `scripts/build-samples.js` - Builds CSS and component files
- `scripts/serve.js` - Static file server with CORS
- `scripts/deploy-to-auth0.js` - Automated Auth0 deployment (NEW!)

## Commands
```bash
npm run serve                      # Build and start server
npm run deploy                     # Deploy all screens to Auth0 (NEW!)
npm run deploy:screen <names>      # Deploy specific screens (NEW!)
npm run build                      # Build without serving
npm run clean                      # Remove built files
```

## What's New
✅ Automated Auth0 deployment via Management API
✅ Environment-based configuration (.env)
✅ Machine-to-Machine authentication
✅ Bulk deployment of all 20 screens
✅ Selective screen deployment
✅ Production-ready workflow

## Getting Started

### Quick Test (No Auth0 Config)
```bash
npm install
npm run serve
# Visit http://localhost:5500
```

### Deploy to Auth0 (Recommended)
```bash
npm install
cp .env.example .env
# Edit .env with your Auth0 credentials
npm run deploy
```

See **QUICK_START.md** for detailed instructions.
