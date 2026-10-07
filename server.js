// Simple zero-dependency server for the GamboNanza WebGL build
// Run:  node server.js   ->   http://127.0.0.1:8080
const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.symbols': 'application/octet-stream',
  '.br': 'application/octet-stream',
  '.gz': 'application/gzip',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  let filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  // Support pre-compressed variants if present (e.g. index.html.gz)
  let encoding = null;
  const acceptsBr = (req.headers['accept-encoding'] || '').includes('br');
  if (acceptsBr && fs.existsSync(filePath + '.br') && !filePath.endsWith('.br')) {
    filePath += '.br';
    encoding = 'br';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found: ' + urlPath);
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    if (encoding) headers['Content-Encoding'] = encoding;
    headers['Cache-Control'] = 'no-cache';
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`GamboNanza running at http://${HOST}:${PORT}`);
});
