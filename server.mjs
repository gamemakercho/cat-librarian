import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.woff':'font/woff'};
export function startServer(port=8000) { return http.createServer(async (req,res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path,'index.html');
    const data = await readFile(path);
    res.writeHead(200, {'Content-Type':types[extname(path)] || 'application/octet-stream','Cache-Control':extname(path)==='.webp'||extname(path)==='.woff'?'public, max-age=86400':'no-cache'});
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port,'127.0.0.1',()=>console.log(`게임: http://127.0.0.1:${port}/\n제작자: http://127.0.0.1:${port}/?review=1`)); }
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) startServer();
