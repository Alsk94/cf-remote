export async function onRequestPost(context) {
  const { request } = context;
  
  try {
    const { code } = await request.json();
    
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Exchange code for access token
    const clientId = context.env.CLOUDFLARE_OAUTH_CLIENT_ID;
    const clientSecret = context.env.CLOUDFLARE_OAUTH_CLIENT_SECRET;
    const redirectUri = new URL(request.headers.get('Referer') || request.url).origin;

    const tokenResponse = await fetch('https://dash.cloudflare.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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

    // Get user's account information
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
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
