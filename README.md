# Cloudflare Zero Trust Remote Control

A mobile-optimized Next.js web application for managing your Cloudflare Zero Trust environment on the go. Built with modern web technologies and designed specifically for mobile devices.

## Features

### 🎯 Core Functionality
- **Tunnel Management**: View, monitor, and control Cloudflare Tunnels with real-time status
- **Access Applications**: Manage Zero Trust applications and policies
- **Gateway Policies**: Quick toggle for security filters and rules
- **Quick Actions Dashboard**: Fast access to your most-used settings

### 📱 Mobile-First Design
- **Bottom Navigation Bar**: Easy thumb-reach navigation for primary sections
- **48x48px Touch Targets**: All interactive elements meet accessibility standards
- **Card-Based Layout**: Optimized for scanning on small screens
- **Pull-to-Refresh**: Natural gesture for updating data
- **Dark Mode**: High-contrast colors for outdoor readability

### 🔐 Security
- **Encrypted Storage**: API credentials encrypted with AES and stored locally
- **Session Management**: Secure cookie-based authentication
- **API Token Verification**: Validates credentials before storage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Cloudflare API v4
- **Encryption**: CryptoJS
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Cloudflare account with Zero Trust enabled
- Cloudflare API Token with appropriate permissions
- Your Cloudflare Account ID

### Installation

1. **Clone or navigate to the project**:
```bash
cd cf-remote
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Configuration

### Cloudflare API Token

To use this application, you'll need a Cloudflare API Token with the following permissions:

- **Account** → **Cloudflare Tunnel** → **Read**
- **Account** → **Access: Apps and Policies** → **Edit**
- **Account** → **Account Firewall Access Rules** → **Edit**
- **Account** → **Zero Trust** → **Edit**

Create your API token at: https://dash.cloudflare.com/profile/api-tokens

### Finding Your Account ID

1. Log in to the Cloudflare Dashboard
2. Select any domain
3. Your Account ID is visible in the right sidebar under "API"

## Project Structure

```
cf-remote/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with bottom nav
│   │   ├── page.tsx           # Home dashboard with quick actions
│   │   ├── login/             # Authentication page
│   │   ├── tunnels/           # Tunnel management (to be implemented)
│   │   ├── applications/      # Access apps management (to be implemented)
│   │   └── gateway/           # Gateway policies (to be implemented)
│   ├── components/            # Reusable UI components
│   │   ├── BottomNav.tsx     # Mobile bottom navigation
│   │   ├── StatusCard.tsx    # Card component for status display
│   │   ├── PullToRefresh.tsx # Pull-to-refresh functionality
│   │   ├── SearchBar.tsx     # Search/filter component
│   │   └── Button.tsx        # Custom button component
│   ├── services/              # API integration layer
│   │   └── cloudflare.ts     # Cloudflare API service
│   └── lib/                   # Utilities and helpers
│       ├── auth.ts           # Authentication & encryption
│       └── utils.ts          # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## API Integration

The application uses the Cloudflare API v4 to manage:

### Tunnels
- `GET /accounts/{account_id}/cfd_tunnel` - List all tunnels
- `GET /accounts/{account_id}/cfd_tunnel/{tunnel_id}` - Get tunnel status
- `DELETE /accounts/{account_id}/cfd_tunnel/{tunnel_id}` - Delete tunnel

### Access Applications
- `GET /accounts/{account_id}/access/apps` - List applications
- `PUT /accounts/{account_id}/access/apps/{app_id}` - Toggle application

### Gateway Policies
- `GET /accounts/{account_id}/gateway/rules` - List policies
- `PUT /accounts/{account_id}/gateway/rules/{rule_id}` - Toggle policy

## Mobile Optimization

### Touch Targets
All interactive elements are at least 48x48px for easy tapping:
- Navigation buttons
- Action buttons
- Toggle switches
- Card tap areas

### Gestures
- **Pull-to-Refresh**: Pull down on any page to refresh data
- **Tap**: Single tap for navigation and actions
- **Scroll**: Smooth scrolling for long lists

### Performance
- Optimized bundle size
- Lazy loading for routes
- Efficient re-renders with React hooks
- Minimal API calls with caching

## Security Best Practices

1. **Never commit API tokens** to version control
2. **Use environment-specific tokens** for development vs production
3. **Regularly rotate API tokens** in Cloudflare dashboard
4. **Review API token permissions** to ensure least privilege
5. **Clear browser data** when logging out from shared devices

## Development

### Running Locally

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Deployment

### Cloudflare Workers Deployment

This app is configured to deploy as a Cloudflare Worker with static assets.

**Quick Deploy**:
```bash
npm run deploy
```

**Manual Steps**:
```bash
# Install dependencies
npm install

# Build the Next.js app
npm run build

# Deploy to Cloudflare Workers
wrangler deploy
```

**First Time Setup**:
```bash
# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

Your app will be deployed to `https://cf-remote.<your-subdomain>.workers.dev`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Other Platforms

This is a standard Next.js application and can be deployed to:
- Vercel (full SSR support)
- Netlify
- AWS Amplify
- Any static hosting platform

## Roadmap

- [ ] Complete Tunnels management page
- [ ] Complete Access Applications page
- [ ] Complete Gateway Policies page
- [ ] Add analytics dashboard
- [ ] Implement notifications for status changes
- [ ] Add offline mode support
- [ ] Multi-account support
- [ ] Export/import configurations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues related to:
- **This application**: Open an issue in this repository
- **Cloudflare API**: Check [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- **Zero Trust**: Visit [Cloudflare Zero Trust Docs](https://developers.cloudflare.com/cloudflare-one/)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Powered by [Cloudflare](https://cloudflare.com/)

---

**Note**: This application requires a Cloudflare account with Zero Trust enabled and appropriate API permissions. The lint errors you see are expected until you run `npm install` to install all dependencies.
