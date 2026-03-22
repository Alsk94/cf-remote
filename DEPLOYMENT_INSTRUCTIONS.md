# Deployment Instructions

## Current Issue

You're seeing a "Page Not Found" error because your Cloudflare project is configured as a **Pages** project but the code is now set up for **Workers** deployment.

## Solution: Choose One Deployment Method

### Option 1: Deploy as Cloudflare Workers (Recommended)

1. **Delete the existing Cloudflare Pages project:**
   - Go to Cloudflare Dashboard → Workers & Pages
   - Find your `cf-remote` project
   - Delete it

2. **Deploy using Wrangler CLI locally:**
   ```bash
   cd /Users/bhaskar/CascadeProjects/windsurf-project/cf-remote
   npm run deploy
   ```
   
3. **Authenticate when prompted:**
   - Wrangler will open a browser for OAuth
   - Approve the connection
   - Deployment will complete automatically

4. **Access your app:**
   - URL will be: `https://cf-remote.<your-subdomain>.workers.dev`

### Option 2: Keep Using Cloudflare Pages

If you prefer to keep using Pages (auto-deployment from GitHub):

1. **Update Cloudflare Pages Settings:**
   - Go to Cloudflare Dashboard → Workers & Pages → cf-remote
   - Settings → Builds & deployments
   - **Remove the "Deploy command"** field (leave it empty)
   - Keep:
     - Build command: `npm run build`
     - Build output directory: `dist`

2. **Revert to Pages configuration:**
   ```bash
   cd /Users/bhaskar/CascadeProjects/windsurf-project/cf-remote
   git checkout 454bb01  # Revert to Pages version
   git push origin main --force
   ```

## Current Configuration

The repository is currently configured for **Workers** deployment with:
- `wrangler.toml` with `[site]` configuration
- `src/index.js` Worker script
- Static files in `dist/` directory

## Recommended: Workers Deployment

Workers deployment gives you full control and is simpler for this use case. Just run:

```bash
npm run deploy
```

And your app will be live!
