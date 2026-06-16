/**
 * Forex Desk CORS Proxy — Cloudflare Worker
 * Proxies requests to external APIs, adding browser-like headers
 * so servers like nfs.faireconomy.media don't return 403.
 *
 * Deploy: wrangler deploy  OR  Cloudflare Dashboard → Workers
 */

const ALLOWED_HOSTS = [
  'nfs.faireconomy.media',
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'api.coinbase.com',
  'api.exchangerate-api.com',
];

const REFERER_MAP = {
  'nfs.faireconomy.media': 'https://www.forexfactory.com/',
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    const reqUrl  = new URL(request.url);
    const target  = reqUrl.searchParams.get('url');

    if (!target) {
      return new Response('Missing ?url= parameter', { status: 400 });
    }

    let targetUrl;
    try { targetUrl = new URL(target); }
    catch { return new Response('Invalid url parameter', { status: 400 }); }

    if (!ALLOWED_HOSTS.some(h => targetUrl.hostname === h || targetUrl.hostname.endsWith('.' + h))) {
      return new Response(`Host not allowed: ${targetUrl.hostname}`, { status: 403 });
    }

    const referer = REFERER_MAP[targetUrl.hostname] || '';

    const upstreamReq = new Request(target, {
      method:  'GET',
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control':   'no-cache',
        ...(referer ? { 'Referer': referer } : {}),
      },
    });

    let upstream;
    try {
      upstream = await fetch(upstreamReq, { cf: { cacheEverything: false } });
    } catch (err) {
      return new Response(`Upstream fetch failed: ${err.message}`, { status: 502 });
    }

    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type':                upstream.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':'GET, OPTIONS',
        'Cache-Control':               'public, max-age=300',
        'X-Proxied-By':                'forex-desk-worker',
      },
    });
  },
};
