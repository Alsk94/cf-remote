# Troubleshooting Cloudflare Deployment

## Common Errors and Solutions

### Error: "This is a Workers project, not a Pages project"

**Cause**: Using wrong deployment command

**Solution**:
```bash
# ❌ Wrong (Workers)
wrangler deploy

# ✅ Correct (Pages)
wrangler pages deploy ./out --project-name=cf-remote
```

### Error: "Directory ./out does not exist"

**Cause**: Haven't built the project yet

**Solution**:
```bash
cd /Users/bhaskar/CascadeProjects/windsurf-project/cf-remote
npm install
npm run build
# Now the ./out directory exists
wrangler pages deploy ./out --project-name=cf-remote
```

### Error: "You are not authenticated"

**Cause**: Not logged into Wrangler

**Solution**:
```bash
wrangler login
# Follow browser authentication
# Then try deploying again
```

### Error: "Project name 'cf-remote' already exists"

**Cause**: Project already created in your Cloudflare account

**Solution Option 1** - Deploy to existing project:
```bash
wrangler pages deploy ./out --project-name=cf-remote
```

**Solution Option 2** - Use different name:
```bash
wrangler pages deploy ./out --project-name=cf-remote-v2
```

### Error: "Build failed" or "npm ERR!"

**Cause**: Missing dependencies or build errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Try building locally first
npm run build

# If build succeeds, then deploy
wrangler pages deploy ./out --project-name=cf-remote
```

### Error: "Module not found" during build

**Cause**: Missing TypeScript types or dependencies

**Solution**:
```bash
npm install --save-dev @types/node @types/react @types/react-dom
npm run build
```

### Error: "Dynamic code evaluation is not available in Workers"

**Cause**: Trying to use server-side features in static export

**Solution**: This app is configured for static export. Ensure you're not using:
- API routes (`/api/*`)
- Server-side rendering (SSR)
- Dynamic routes without `generateStaticParams`

Check `next.config.mjs` has:
```javascript
{
  output: 'export',
  images: { unoptimized: true }
}
```

## Step-by-Step Deployment Process

### 1. Verify Prerequisites
```bash
# Check Node version (should be 18+)
node --version

# Check if wrangler is installed
wrangler --version

# If not installed:
npm install -g wrangler
```

### 2. Build the Project
```bash
cd /Users/bhaskar/CascadeProjects/windsurf-project/cf-remote

# Install dependencies
npm install

# Build for production
npm run build

# Verify ./out directory exists
ls -la ./out
```

### 3. Login to Cloudflare
```bash
wrangler login
# Browser will open for authentication
```

### 4. Deploy to Pages
```bash
# First deployment (creates project)
wrangler pages deploy ./out --project-name=cf-remote

# Subsequent deployments
wrangler pages deploy ./out
```

### 5. Verify Deployment
- Check output for deployment URL
- Visit `https://cf-remote.pages.dev`
- Test login functionality

## Alternative: Deploy via Dashboard

If CLI deployment fails, use the Cloudflare Dashboard:

1. **Build locally**:
```bash
npm run build
```

2. **Create ZIP of ./out directory**:
```bash
cd out
zip -r ../cf-remote-build.zip .
cd ..
```

3. **Upload via Dashboard**:
   - Go to https://dash.cloudflare.com/
   - Navigate to Pages
   - Create new project
   - Upload `cf-remote-build.zip`

## Debugging Tips

### Check Build Output
```bash
npm run build
# Look for errors in output
# Verify ./out directory has files
```

### Test Locally Before Deploy
```bash
# Build first
npm run build

# Serve locally
npx serve ./out
# Visit http://localhost:3000
```

### Check Wrangler Configuration
```bash
# View wrangler config
cat wrangler.toml

# Should show:
# name = "cf-remote"
# pages_build_output_dir = "./out"
```

### Verify File Structure
```bash
# Check if build output exists
ls -la ./out

# Should contain:
# - index.html
# - _next/ directory
# - Static assets
```

## Getting Help

If you're still stuck:

1. **Share the exact error message** - Copy the full terminal output
2. **Check Cloudflare Status** - https://www.cloudflarestatus.com/
3. **Cloudflare Discord** - https://discord.cloudflare.com/
4. **Cloudflare Community** - https://community.cloudflare.com/

## Quick Reference

**Correct deployment command:**
```bash
npm run deploy
```

Or manually:
```bash
npm run build && wrangler pages deploy ./out --project-name=cf-remote
```

**NOT these commands:**
- ❌ `wrangler deploy` (Workers only)
- ❌ `wrangler publish` (Workers only)
- ❌ `npm run start` (Development only)
