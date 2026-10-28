#!/usr/bin/env node
// Minimal zero-dependency static server for previewing site/dist locally (not used in production).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const DIST = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = Number(process.env.PORT || 8788);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.txt': 'text/plain', '.csv': 'text/csv; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.xls': 'application/vnd.ms-excel' };
function loadRedirects() {
  const file = join(DIST, '_redirects');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split('\n').flatMap((line) => {
    const s = line.trim();
    if (!s || s.startsWith('#')) return [];
    const [from, to, status] = s.split(/\s+/);
    if (!from || !to) return [];
    return [{ from, to, status: Number(status) || 302 }];
  });
}
export function serve(port = PORT) {
  const redirects = loadRedirects();
  const srv = createServer(async (req, res) => {
    const pathOnly = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const hit = redirects.find((r) => r.from === pathOnly);
    if (hit) { res.writeHead(hit.status, { Location: hit.to }); res.end(); return; }
    let p = normalize(pathOnly).replace(/^(\.\.[/\\])+/, '');
    let f = join(DIST, p);
    try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch {}
    try { const b = await readFile(f); res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(b); }
    catch { res.writeHead(404, { 'Content-Type': TYPES['.html'] }); res.end(await readFile(join(DIST, '404.html')).catch(() => 'Not found')); }
  });
  return new Promise((r) => srv.listen(port, () => r(srv)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) serve().then(() => console.log(`Serving ${DIST} at http://localhost:${PORT}`));
