# Auth0 Configuration Guide

## Two Ways to Configure Auth0

### Option 1: Automated Deployment (Recommended) ⚡

Use the deployment script to automatically update all screens in your Auth0 tenant.

### Option 2: Manual Configuration 🖱️

Configure each screen individually through the Auth0 Dashboard.

---

## Option 1: Automated Deployment ⚡

### Step 1: Create Machine-to-Machine Application

1. Go to **Auth0 Dashboard → Applications → Applications**
2. Click **Create Application**
3. Name: "ACUL Deployment"
4. Type: **Machine to Machine Applications**
5. Authorize for: **Auth0 Management API**
6. Grant permissions:
   - ✅ `read:prompts`
   - ✅ `update:prompts`
7. Copy **Client ID** and **Client Secret**

### Step 2: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit with your values
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_m2m_client_id
AUTH0_CLIENT_SECRET=your_m2m_client_secret
CSS_URL=http://localhost:5500/styles.css
```

### Step 3: Start Server

```bash
npm run serve
```

Keep this running - your CSS will be served from localhost.

### Step 4: Deploy to Auth0

```bash
# Deploy all 20 screens
npm run deploy

# Or deploy specific screens
npm run deploy:screen login signup mfa-login-options
```

### Step 5: Test

Try logging into your application! Auth0 will now use:
- **CSS**: Loaded from `http://localhost:5500/styles.css`
- **Components**: Deployed React code from your built files

### Deployment Output

```
🚀 Auth0 Deployment Starting...
🔐 Authenticating with Auth0...
✓ Authentication successful

📝 Updating login/login...
  ✓ Updated successfully
📝 Updating login/login-id...
  ✓ Updated successfully

📊 Deployment Summary:
  ✓ Success: 20
  ❌ Failed: 0

✅ All screens deployed successfully!
```

---

## Option 2: Manual Configuration 🖱️

### 1. Start the Server

```bash
npm run serve
```

✅ Server running on: **http://localhost:5500**

### 2. Configure Your Auth0 Tenant

#### A. Go to Auth0 Dashboard

1. Navigate to **Branding** → **Universal Login** → **Advanced Customization**
2. Click **New Universal Login Experience**

#### B. Configure Each Screen

For each screen you want to customize (e.g., Login, Signup, MFA):

**1. Select the screen** (e.g., "login-id")

**2. Add CSS:**
```
http://localhost:5500/styles.css
```

**3. Get component code:**
- Open: `http://localhost:5500/login-id/component.tsx`
- Copy the entire code
- Paste into your Auth0 screen customization

**4. Install required packages** (in your Auth0 project):
```bash
npm install @auth0/auth0-acul-js react react-dom
```

### 3. Test Your Login Flow

1. Try logging into your application
2. Auth0 will load the CSS from your localhost
3. The component code you pasted will render with the styles

## Production Deployment Checklist

### For Production Use

⚠️ **Never use localhost URLs in production!**

1. **Host Your CSS**
   ```bash
   # Update CSS_URL in .env
   CSS_URL=https://your-cdn.com/auth0/styles.css
   ```

2. **Upload CSS to CDN**
   - Upload `dist/styles.css` to your CDN/S3/hosting
   - Enable CORS headers for Auth0
   - Use HTTPS URLs

3. **Deploy Components**
   ```bash
   # Deploy with production CSS URL
   npm run deploy
   ```

4. **Test Production**
   - Test login flow with production URLs
   - Verify CSS loads from CDN
   - Check browser console for errors

### Updating Components

```bash
# Fetch latest from Auth0 repo
npm run fetch-samples

# Build with new samples
npm run build

# Deploy to Auth0
npm run deploy
```

---

## Comparison: Automated vs Manual

| Feature | Automated (`npm run deploy`) | Manual (Dashboard) |
|---------|------------------------------|-------------------|
| Time to deploy 20 screens | ~30 seconds | ~30 minutes |
| Consistency | ✅ Guaranteed | ⚠️ Manual errors possible |
| Bulk updates | ✅ One command | ❌ Click each screen |
| Version control | ✅ Script in git | ❌ Manual process |
| Rollback | ✅ Re-run script | ❌ Manual undo |
| CI/CD ready | ✅ Yes | ❌ No |

---

## URL Reference (Manual Method)

### Global Assets (Use for All Screens)

- **CSS**: `http://localhost:5500/styles.css`
- **Index**: `http://localhost:5500/`

### Per-Screen Components

| Screen | Component URL |
|--------|--------------|
| Login | `http://localhost:5500/login/component.tsx` |
| Login ID | `http://localhost:5500/login-id/component.tsx` |
| Login Password | `http://localhost:5500/login-password/component.tsx` |
| Signup | `http://localhost:5500/signup/component.tsx` |
| Signup ID | `http://localhost:5500/signup-id/component.tsx` |
| Consent | `http://localhost:5500/consent/component.tsx` |
| MFA Options | `http://localhost:5500/mfa-login-options/component.tsx` |
| Logout | `http://localhost:5500/logout/component.tsx` |
| ... | (and 12 more) |

## Example: Configuring Login Screen

### In Auth0 Dashboard:

1. **Screen**: Login ID
2. **CSS URL**: 
   ```
   http://localhost:5500/styles.css
   ```

3. **Component Code** (from `http://localhost:5500/login-id/component.tsx`):
   ```tsx
   import React, { useMemo } from 'react';
   import LoginId from "@auth0/auth0-acul-js/login-id";
   
   const LoginIdScreen: React.FC = () => {
     const [loginIdManager] = useState(() => new LoginId());
     // ... rest of component code
   };
   
   export default LoginIdScreen;
   ```

4. **Save and Test**

## Troubleshooting

### CSS Not Loading

- ✅ Check server is running: `npm run serve`
- ✅ Verify URL: `http://localhost:5500/styles.css`
- ✅ Check browser console for CORS errors

### Component Not Rendering

- ✅ Ensure `@auth0/auth0-acul-js` is installed
- ✅ Check component code is complete
- ✅ Verify imports are correct

### Updates Not Showing

```bash
# Rebuild to get latest samples
npm run build

# Then restart server
npm run serve
```

## Production Use

⚠️ **Important**: This is for local testing only!

For production:
1. Build your assets
2. Host CSS on a CDN or your own server
3. Use proper HTTPS URLs in Auth0 configuration
4. Never use `localhost` URLs in production

## Tips

- 💡 Keep the server running while testing
- 💡 One CSS file serves all screens
- 💡 Each screen gets its own component file
- 💡 Rebuild to get latest samples from Auth0 repo
- 💡 Component code needs Auth0 ACUL SDK to work

## Next Steps

1. ✅ Configure your first screen
2. ✅ Test the login flow
3. ✅ Customize more screens as needed
4. ✅ When ready, move to production hosting

---

**Happy Testing!** 🚀
