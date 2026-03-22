# Deploy Using API Token (Recommended)

Since OAuth authentication is having issues, use an API token instead:

## Step 1: Create API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: **"Edit Cloudflare Workers"**
4. Click "Continue to summary"
5. Click "Create Token"
6. **Copy the token** (you won't see it again!)

## Step 2: Deploy with Token

Run these commands in your terminal:

```bash
cd /Users/bhaskar/CascadeProjects/windsurf-project/cf-remote

# Set your API token (replace YOUR_TOKEN with the actual token)
export CLOUDFLARE_API_TOKEN="YOUR_TOKEN"

# Deploy
npx wrangler deploy
```

## Step 3: Access Your App

After successful deployment, you'll see:
```
✨ Deployed cf-remote
   https://cf-remote.YOUR-SUBDOMAIN.workers.dev
```

Visit that URL to access your Zero Trust Manager!

## Troubleshooting

If you get permission errors, make sure your API token has these permissions:
- Account: Workers Scripts (Edit)
- Account: Workers KV Storage (Edit)
- Zone: Zone (Read)

## Your Configuration

- Account ID: `8f4f597adc71e011d20f8f20c7bf0d95` (Personal Account)
- Worker Name: `cf-remote`
