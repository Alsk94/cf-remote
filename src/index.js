import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, url, env);
    }
    
    // Serve static files
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          mapRequestToAsset: req => {
            const url = new URL(req.url);
            if (url.pathname === '/') {
              return new Request(`${url.origin}/index.html`, req);
            }
            return req;
          },
        }
      );
    } catch (e) {
      try {
        return await getAssetFromKV(
          {
            request: new Request(`${url.origin}/index.html`, request),
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
          }
        );
      } catch (e) {
        return new Response(`Error loading page: ${e.message}`, { 
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
  },
};

async function handleApiRequest(request, url, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Account-ID, X-API-Token',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // OAuth endpoint - handle token exchange
  if (url.pathname === '/api/oauth/token') {
    try {
      const { code } = await request.json();
      
      if (!code) {
        return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const clientId = env.CLOUDFLARE_OAUTH_CLIENT_ID || 'YOUR_CLOUDFLARE_OAUTH_CLIENT_ID';
      const clientSecret = env.CLOUDFLARE_OAUTH_CLIENT_SECRET || '';
      const redirectUri = new URL(request.headers.get('Referer') || request.url).origin;

      const tokenResponse = await fetch('https://dash.cloudflare.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const accountsResponse = await fetch('https://api.cloudflare.com/client/v4/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch account information');
      }

      const accountsData = await accountsResponse.json();
      const accountId = accountsData.result[0]?.id;

      if (!accountId) {
        throw new Error('No account found');
      }

      return new Response(JSON.stringify({
        access_token: accessToken,
        account_id: accountId,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('OAuth token exchange error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Regular API proxy - requires credentials
  const accountId = request.headers.get('X-Account-ID');
  const apiToken = request.headers.get('X-API-Token');

  if (!accountId || !apiToken) {
    return new Response(JSON.stringify({ error: 'Missing credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiPath = url.pathname.replace('/api', '');
  const cfApiUrl = `https://api.cloudflare.com/client/v4${apiPath}${url.search}`;

  try {
    const cfRequest = new Request(cfApiUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    const cfResponse = await fetch(cfRequest);
    const data = await cfResponse.text();

    return new Response(data, {
      status: cfResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
