# Deploying to Cloudflare Pages

This Next.js application is configured for deployment on **Cloudflare Pages**, which provides:
- Global CDN distribution
- Automatic HTTPS
- Free hosting for static sites
- Edge network performance

## Why Cloudflare Pages (not Workers)?

Next.js with App Router uses React Server Components and requires a Node.js runtime. Cloudflare Workers has limitations that make it incompatible with full Next.js apps. **Cloudflare Pages** is the recommended platform for Next.js on Cloudflare infrastructure.

## Deployment Options

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** → **Create a project**
   - Click **Connect to Git**
   - Select your repository
   - Configure build settings:
     - **Framework preset**: Next.js
     - **Build command**: `npm run build`
     - **Build output directory**: `out`
     - **Node version**: `18`

3. **Deploy**:
   - Click **Save and Deploy**
   - Cloudflare will automatically build and deploy your app
   - You'll get a `*.pages.dev` URL

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler** (if not already installed):
```bash
npm install -g wrangler
```

2. **Login to Cloudflare**:
```bash
wrangler login
```

3. **Build your application**:
```bash
cd cf-remote
npm install
npm run build
```

4. **Deploy to Pages**:
```bash
npm run deploy
```

Or manually:
```bash
wrangler pages deploy ./out --project-name=cf-remote
```

5. **Access your app**:
   - Your app will be available at `https://cf-remote.pages.dev`
   - Or your custom domain if configured

## Configuration

### Environment Variables

If you need to add environment variables (though this app stores credentials client-side):

**Via Dashboard**:
1. Go to your Pages project
2. Settings → Environment variables
3. Add variables for Production/Preview

**Via Wrangler**:
```bash
wrangler pages secret put VARIABLE_NAME
```

### Custom Domain

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Follow the DNS configuration steps

## Build Configuration

The project is configured for static export:

**next.config.mjs**:
```javascript
{
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

This generates a static site in the `./out` directory that Cloudflare Pages can serve.

## Continuous Deployment

Once connected via Git, Cloudflare Pages will:
- ✅ Automatically deploy on every push to `main`
- ✅ Create preview deployments for pull requests
- ✅ Provide deployment history and rollback
- ✅ Show build logs for debugging

## Performance Optimization

Cloudflare Pages provides:
- **Global CDN**: Your app is served from 200+ data centers
- **HTTP/3 & QUIC**: Latest protocols for faster loading
- **Brotli compression**: Automatic compression
- **Edge caching**: Static assets cached at the edge

## Troubleshooting

### Build Fails

Check that:
- Node version is set to 18 or higher (`.node-version` file)
- All dependencies are in `package.json`
- Build command is `npm run build`
- Output directory is `out`

### App Not Loading

Verify:
- Static export is enabled in `next.config.mjs`
- No server-side features are used (API routes, ISR, etc.)
- All paths are relative, not absolute

### API Calls Failing

This app makes client-side API calls to Cloudflare. Ensure:
- CORS is properly configured
- API tokens have correct permissions
- Credentials are entered correctly in the login page

## Monitoring

Monitor your deployment:
- **Analytics**: Built-in Cloudflare Web Analytics
- **Logs**: Real-time function logs in the dashboard
- **Performance**: Core Web Vitals tracking

## Cost

Cloudflare Pages is **free** for:
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 build at a time

Perfect for personal projects and small teams!

## Alternative: Vercel Deployment

If you prefer Vercel (also excellent for Next.js):

```bash
npm install -g vercel
vercel
```

Vercel supports the full Next.js feature set including server-side rendering.

## Summary

**Quick Deploy**:
```bash
cd cf-remote
npm install
npm run build
wrangler pages deploy ./out --project-name=cf-remote
```

Your Cloudflare Zero Trust Remote Control app will be live on Cloudflare's global network! 🚀
