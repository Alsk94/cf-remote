export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve static files
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    
    try {
      const asset = await env.ASSETS.fetch(new URL(path, request.url));
      return asset;
    } catch (e) {
      // If asset not found, return index.html for SPA routing
      try {
        return await env.ASSETS.fetch(new URL('/index.html', request.url));
      } catch (e) {
        return new Response('Not Found', { status: 404 });
      }
    }
  },
};
