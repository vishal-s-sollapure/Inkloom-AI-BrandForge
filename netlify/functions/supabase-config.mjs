/**
 * Netlify Serverless Function: GET /api/supabase-config
 * Provides public Supabase client credentials (URL & public anon key)
 * to frontend clients without exposing any service-role secrets.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const isConfigured = Boolean(
    url &&
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    anonKey &&
    anonKey.length > 20 &&
    !anonKey.includes('placeholder')
  );

  return new Response(
    JSON.stringify({
      isConfigured,
      url: isConfigured ? url : '',
      anonKey: isConfigured ? anonKey : '',
      status: isConfigured ? 'configured' : 'unconfigured'
    }),
    { status: 200, headers: CORS_HEADERS }
  );
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const isConfigured = Boolean(
    url &&
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    anonKey &&
    anonKey.length > 20 &&
    !anonKey.includes('placeholder')
  );

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      isConfigured,
      url: isConfigured ? url : '',
      anonKey: isConfigured ? anonKey : '',
      status: isConfigured ? 'configured' : 'unconfigured'
    })
  };
}
