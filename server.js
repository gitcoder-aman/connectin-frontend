// Zero-dependency dev server for the ConnectIn frontend.
// Serves static files and proxies API calls to the backend so the browser
// only ever talks to this origin (no CORS, no preflight OPTIONS).
//
//   Browser -> http://localhost:3000
//     /api/*     -> http://localhost:8080   (API gateway)
//     /upload/*  -> http://localhost:9050   (uploader-service)
//
// Run:  node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const GATEWAY = 'http://localhost:8080';
const UPLOADER = 'http://localhost:9050';
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function proxy(req, res, targetBase) {
  const target = new URL(req.url, targetBase);

  // Copy incoming headers (includes Authorization and X-User-Id)
  const headers = { ...req.headers };
  headers.host = target.host;

  const proxyReq = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: `Proxy could not reach backend at ${targetBase}: ${err.message}`,
      })
    );
  });

  req.pipe(proxyReq);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxy(req, res, GATEWAY);
  } else if (req.url.startsWith('/upload/')) {
    proxy(req, res, UPLOADER);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`ConnectIn frontend running:   http://localhost:${PORT}`);
  console.log(`  /api/*    -> ${GATEWAY}`);
  console.log(`  /upload/* -> ${UPLOADER}`);
});