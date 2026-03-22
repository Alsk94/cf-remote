# Cloudflare OAuth Setup Guide

Your Zero Trust Manager now supports **Cloudflare OAuth login**! Users can sign in with their Cloudflare account instead of manually entering API tokens.

## 🔧 Setup Requirements

To enable OAuth login, you need to:

### 1. Create a Cloudflare OAuth Application

1. Go to your Cloudflare Dashboard
2. Navigate to **My Profile** → **API Tokens** → **OAuth Applications**
3. Click **Create Application**
4. Fill in the details:
   - **Application Name:** Zero Trust Manager
   - **Redirect URLs:** `https://cf-remote.bhaskarsunit.workers.dev` (your Worker URL)
   - **Scopes:** Select:
     - `account:read`
     - `gateway:read`
     - `gateway:edit`
5. Click **Create**
6. **Save your Client ID and Client Secret** (you won't see the secret again!)

### 2. Configure Environment Variables

Add your OAuth credentials to your Cloudflare Worker:

```bash
# Set environment variables
wrangler secret put CLOUDFLARE_OAUTH_CLIENT_ID
# Paste your Client ID when prompted

wrangler secret put CLOUDFLARE_OAUTH_CLIENT_SECRET
# Paste your Client Secret when prompted
```

Or via Cloudflare Dashboard:
1. Go to **Workers & Pages** → **cf-remote**
2. **Settings** → **Variables**
3. Add:
   - `CLOUDFLARE_OAUTH_CLIENT_ID` = your Client ID
   - `CLOUDFLARE_OAUTH_CLIENT_SECRET` = your Client Secret (encrypted)

### 3. Update Frontend Client ID

Edit `public/app-oauth.js` line 51:

```javascript
const clientId = 'YOUR_ACTUAL_CLIENT_ID_HERE';
```

Replace `YOUR_CLOUDFLARE_OAUTH_CLIENT_ID` with your actual Client ID.

### 4. Rebuild and Deploy

```bash
npm run build
CLOUDFLARE_API_TOKEN="your_token" npx wrangler deploy
```

## ✅ How It Works

### OAuth Flow:
1. User clicks **"Sign in with Cloudflare"**
2. Redirected to Cloudflare OAuth authorization page
3. User approves access
4. Cloudflare redirects back with authorization code
5. Worker exchanges code for access token
6. Worker fetches user's account ID
7. User is logged in automatically!

### Manual Login (Fallback):
- Click **"Manual Login"** on the login screen
- Enter Account ID and API Token manually
- Works without OAuth configuration

## 🔐 Security Notes

- OAuth tokens are stored in `localStorage` (same as manual tokens)
- Client Secret is stored securely in Worker environment variables
- Never expose Client Secret in frontend code
- Tokens have the same permissions as the OAuth scopes granted

## 🚀 Your App URLs

- **Live App:** https://cf-remote.bhaskarsunit.workers.dev
- **OAuth Callback:** https://cf-remote.bhaskarsunit.workers.dev (same URL)

## 📋 Current Status

- ✅ OAuth UI implemented
- ✅ OAuth callback handler created (`/api/oauth/token`)
- ✅ Manual login fallback available
- ⚠️ **Action Required:** Set up OAuth application and configure credentials

## 🔄 Testing OAuth

Once configured:
1. Visit https://cf-remote.bhaskarsunit.workers.dev
2. Click **"Sign in with Cloudflare"**
3. Approve access on Cloudflare
4. You'll be redirected back and logged in automatically!

If OAuth isn't configured yet, users can still use **Manual Login** with their API tokens.
