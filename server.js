'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { createApi } = require('./src/api');

const PORT = Number(process.env.PORT || 8000);
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const api = createApi();

function sendFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);
  const isHtml = ext === '.html';
  const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.ico'].includes(ext);
  const cache = isHtml || !isImage ? 'no-cache' : 'public, max-age=604800';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': cache
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

function serveStatic(req, res, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }
  if (rel === '/' || rel === '') rel = '/index.html';

  const resolved = path.resolve(PUBLIC_DIR, '.' + rel);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== PUBLIC_DIR) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    sendFile(req, res, resolved);
    return;
  }

  // SPA fallback: unknown paths (without extension) return the app shell.
  if (!path.extname(resolved)) {
    sendFile(req, res, path.join(PUBLIC_DIR, 'index.html'));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname.startsWith('/api/')) {
    Promise.resolve(api.handle(req, res, url)).catch((err) => {
      console.error('[api] unhandled error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: { code: 'INTERNAL', message: '服务器开小差了，请稍后再试' } }));
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method Not Allowed');
    return;
  }

  try {
    serveStatic(req, res, url.pathname);
  } catch (err) {
    console.error('[static] error:', err);
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[nuanyue] listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`[nuanyue] received ${signal}, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
