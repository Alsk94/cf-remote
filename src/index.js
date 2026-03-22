import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API proxy requests
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, url);
    }
    
    // Serve static files from KV
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          mapRequestToAsset: req => {
            // Serve index.html for root path
            const url = new URL(req.url);
            if (url.pathname === '/') {
              return new Request(`${url.origin}/index.html`, req);
            }
            return req;
          },
        }
      );
    } catch (e) {
      // If asset not found, serve index.html for SPA routing
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

async function handleApiRequest(request, url) {
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Account-ID, X-API-Token',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get credentials from headers
  const accountId = request.headers.get('X-Account-ID');
  const apiToken = request.headers.get('X-API-Token');

  if (!accountId || !apiToken) {
    return new Response(JSON.stringify({ error: 'Missing credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Proxy to Cloudflare API
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
