// Lightweight zero-dependency static and API server for BrandForge (ESM)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reviewBrand } from './netlify/functions/reviewBrandCore.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load .env file if present in root
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    } else {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...vals] = trimmed.split('=');
          const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
} catch (e) {
  // Silent fallback if .env cannot be loaded
}

const PORT = process.env.PORT || 5173;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const [reqUrl] = req.url.split('?');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    return res.end();
  }

  // Handle Serverless API Endpoint: POST /api/review-brand
  if (reqUrl === '/api/review-brand' || reqUrl === '/.netlify/functions/review-brand') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    }

    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
      if (rawBody.length > 1e6) {
        // Guard against massive payloads (>1MB)
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large.' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const body = rawBody ? JSON.parse(rawBody) : {};
        const {
          title,
          contentType,
          rawText,
          guidelines,
          forceEngine
        } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        const model = body.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

        const result = await reviewBrand({
          title,
          contentType,
          rawText,
          guidelines,
          apiKey,
          model,
          forceEngine
        });

        res.writeHead(result.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(result.status >= 400 ? { error: result.error, validation: result.validation } : result.data));
      } catch (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Internal server error', message: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let targetPath = reqUrl === '/' ? '/index.html' : reqUrl;
  const filePath = path.join(__dirname, targetPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`BrandForge server running at http://127.0.0.1:${PORT}/`);
  console.log(`AI Review endpoint available at POST http://127.0.0.1:${PORT}/api/review-brand`);
});
