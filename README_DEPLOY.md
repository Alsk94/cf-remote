# Quick Deployment Guide

## Fix the 404 Error

Your app is showing "Page Not Found" because it's configured for Workers but deployed as Pages.

## Deploy Now (Choose One Method)

### Method 1: OAuth (Recommended)
```bash
npm run deploy
# Browser will open - click "Allow"
```

### Method 2: API Token
1. Create API token: https://dash.cloudflare.com/profile/api-tokens
   - Template: "Edit Cloudflare Workers"
   - Permissions: Workers Scripts:Edit, Workers KV:Edit

2. Set environment variables:
```bash
export CLOUDFLARE_API_TOKEN="your_token"
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
npm run deploy
```

### Method 3: Wrangler Login
```bash
npx wrangler login
npm run deploy
```

## After Deployment

Your app will be available at:
- `https://cf-remote.<your-subdomain>.workers.dev`

## Delete Old Pages Project (Optional)

To avoid confusion, delete the old Pages project:
1. Go to Cloudflare Dashboard → Workers & Pages
2. Find "cf-remote" 
3. Settings → Delete project

