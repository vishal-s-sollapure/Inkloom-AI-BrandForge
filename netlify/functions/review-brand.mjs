/**
 * Netlify Serverless Function: POST /api/review-brand
 * Inkloom AI Brand Governance Challenge (Round 3)
 */

import { reviewBrand } from './reviewBrandCore.mjs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Netlify v2 standard export
export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    let body = {};
    try {
      body = await req.json();
    } catch (parseErr) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request body.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const {
      title,
      contentType,
      rawText,
      guidelines,
      forceEngine,
      diagnostic
    } = body;

    // Check multiple potential environment variable names with whitespace and quote stripping
    const envVarName = process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : (process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY' : (process.env.GOOGLE_GEMINI_API_KEY ? 'GOOGLE_GEMINI_API_KEY' : 'NONE'));
    const rawApiKey = (envVarName !== 'NONE' ? process.env[envVarName] : '') || '';
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '');
    const model = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();

    // Safe diagnostic endpoint without exposing any key metadata or secrets
    if (diagnostic === true || (req.url && req.url.includes('diagnostic=true'))) {
      const isConfigured = Boolean(apiKey && apiKey.length >= 20 && !apiKey.includes('placeholder'));
      return new Response(
        JSON.stringify({
          status: 'ok',
          geminiConfigured: isConfigured,
          model
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const result = await reviewBrand({
      title,
      contentType,
      rawText,
      guidelines,
      apiKey,
      model,
      forceEngine
    });

    if (result.status >= 400) {
      return new Response(
        JSON.stringify({ error: result.error, validation: result.validation }),
        { status: result.status, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify(result.data),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error processing brand review.',
        message: err.message
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
};

// Also export classic AWS Lambda / Netlify v1 handler for backward-compatibility
export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const {
      title,
      contentType,
      rawText,
      guidelines,
      forceEngine,
      diagnostic
    } = body;

    // Check multiple potential environment variable names with whitespace and quote stripping
    const envVarName = process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : (process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY' : (process.env.GOOGLE_GEMINI_API_KEY ? 'GOOGLE_GEMINI_API_KEY' : 'NONE'));
    const rawApiKey = (envVarName !== 'NONE' ? process.env[envVarName] : '') || '';
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '');
    const model = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();

    // Safe diagnostic endpoint without exposing any key metadata or secrets
    if (diagnostic === true || (req.url && req.url.includes('diagnostic=true'))) {
      const isConfigured = Boolean(apiKey && apiKey.length >= 20 && !apiKey.includes('placeholder'));
      return new Response(
        JSON.stringify({
          status: 'ok',
          geminiConfigured: isConfigured,
          model
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const result = await reviewBrand({
      title,
      contentType,
      rawText,
      guidelines,
      apiKey,
      model,
      forceEngine
    });

    return {
      statusCode: result.status,
      headers: CORS_HEADERS,
      body: JSON.stringify(result.status >= 400 ? { error: result.error } : result.data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal server error processing brand review.',
        message: err.message
      })
    };
  }
}

