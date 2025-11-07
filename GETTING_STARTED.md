# Getting Started with ACUL Tester

## What You Have Now

✅ **Automated Sample Fetching** - The project automatically downloads the latest Auth0 ACUL code samples from GitHub  
✅ **Local Development Server** - Running on http://localhost:5500  
✅ **TailwindCSS Build System** - All styles are processed and optimized  
✅ **React + TypeScript** - Full development environment  

## Your Development Server is Running! 🚀

The server is currently live at: **http://localhost:5500**

## Project Overview

### What Happens During Build

1. **`npm run fetch-samples`** - Automatically runs and:
   - Downloads 20+ example markdown files from the Auth0 repository
   - Extracts React/TailwindCSS code blocks
   - Converts them into TypeScript components
   - Saves them to `src/samples/` (auto-generated, gitignored)
   - Creates `manifest.json` with metadata
   - Creates `index.ts` with component exports

2. **Vite builds the project** - Bundles React and processes TailwindCSS

### Available Commands

```bash
# Development (fetches samples + starts dev server)
npm run dev

# Build for production (fetches samples + builds)
npm run build

# Preview production build
npm run preview

# Just fetch samples (no build)
npm run fetch-samples
```

### Fetched Samples

Your project now includes these Auth0 ACUL screens:

- ✅ login.tsx
- ✅ login-id.tsx
- ✅ login-password.tsx
- ✅ signup.tsx
- ✅ signup-id.tsx
- ✅ signup-password.tsx
- ✅ consent.tsx
- ✅ device-code-confirmation.tsx
- ✅ email-otp-challenge.tsx
- ✅ email-verification-result.tsx
- ✅ login-email-verification.tsx
- ✅ logout.tsx
- ✅ logout-complete.tsx
- ✅ mfa-enroll-result.tsx
- ✅ mfa-login-options.tsx
- ✅ mfa-otp-enrollment-code.tsx
- ✅ organization-picker.tsx
- ✅ organization-selection.tsx
- ✅ redeem-ticket.tsx
- ✅ reset-password-request.tsx

### File Structure

```
acul-tester/
├── scripts/
│   └── fetch-samples.js       # Automated fetcher (runs before each build)
│
├── src/
│   ├── samples/               # AUTO-GENERATED - Don't edit manually!
│   │   ├── login.tsx         # Fetched from GitHub
│   │   ├── signup.tsx        # Fetched from GitHub
│   │   ├── ...               # 20+ components
│   │   ├── index.ts          # Component exports
│   │   └── manifest.json     # Sample metadata
│   │
│   ├── App.tsx               # Sample viewer UI
│   ├── main.tsx              # Entry point
│   └── index.css             # TailwindCSS imports
│
├── dist/                      # Build output (created by npm run build)
├── index.html                # HTML entry
└── vite.config.js            # Vite config (port 5500)
```

### Key Features

1. **Always Fresh** - Samples are fetched on every build, ensuring you have the latest code
2. **No Manual Copying** - Everything is automated via the fetch script
3. **Git-Friendly** - `src/samples/` is gitignored since it's auto-generated
4. **Production Ready** - Built files are optimized and ready to deploy

### Next Steps

1. **View the site** - Open http://localhost:5500 in your browser
2. **Explore samples** - Browse through the different Auth0 ACUL screens
3. **Customize the viewer** - Edit `src/App.tsx` to change how samples are displayed
4. **Build for production** - Run `npm run build` when ready to deploy

### Important Notes

⚠️ **Do NOT edit files in `src/samples/`** - They will be overwritten on the next build!

✅ **To get latest samples** - Just run `npm run fetch-samples` or any build command

✅ **Samples come from** - https://github.com/auth0/universal-login/tree/master/packages/auth0-acul-js/examples

### Deployment

When ready to deploy:

```bash
npm run build
```

This creates optimized files in `dist/` that you can:
- Upload to any static hosting service
- Serve with any web server
- Deploy to Netlify, Vercel, GitHub Pages, etc.

The built files will work on any server - just point to `dist/index.html`.

## Questions?

- 📚 [Auth0 ACUL Documentation](https://github.com/auth0/universal-login/tree/master/packages/auth0-acul-js)
- 💻 [Source Examples](https://github.com/auth0/universal-login/tree/master/packages/auth0-acul-js/examples)
- 🎨 [TailwindCSS Docs](https://tailwindcss.com/)
- ⚡ [Vite Docs](https://vitejs.dev/)

---

**Enjoy building with Auth0 ACUL!** 🎉
