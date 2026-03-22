// Import static assets
import indexHtml from '../dist/index.html';
import appJs from '../dist/app.js';
import stylesCss from '../dist/styles.css';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API proxy requests
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, url);
    }
    
    // Serve static files
    if (url.pathname === '/app.js') {
      return new Response(appJs, {
        headers: { 
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    if (url.pathname === '/styles.css') {
      return new Response(stylesCss, {
        headers: { 
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // Serve index.html for all other routes (SPA)
    return new Response(indexHtml, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      }
    });
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
