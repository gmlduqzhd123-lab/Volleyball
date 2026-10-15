import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith("/volleyball/")) {
    res.writeHead(404).end();
    return;
  }
  const file = resolve(
    root,
    decodeURIComponent(url.pathname.slice("/volleyball/".length)) ||
      "index.html",
  );
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const bytes = await readFile(file);
    res
      .writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
      })
      .end(bytes);
  } catch {
    res.writeHead(404).end();
  }
}).listen(Number(process.env.VOLLEYBALL_BUILD_PORT ?? 5184), "127.0.0.1");
