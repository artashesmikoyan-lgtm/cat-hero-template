import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

http.createServer((req, res) => {
  const url = new URL(req.url || "/", "http://local");
  const p = decodeURIComponent(url.pathname);
  if (p === "/readyz") {
    res.writeHead(fs.existsSync(path.join(root, "index.html")) ? 204 : 503); return res.end();
  }
  let f = path.join(root, path.normalize(p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) f = path.join(root, "index.html");
  const ext = path.extname(f);
  const immutable = (p.includes("/assets/") || (p.includes("/frames/") && ext === ".webp" && url.search));
  res.writeHead(200, {
    "Content-Type": types[ext] || "application/octet-stream",
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-store",
  });
  fs.createReadStream(f).pipe(res);
}).listen(8081, "0.0.0.0", () => console.log("hero on :8081"));