import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

async function files(dir, prefix = "") {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await files(join(dir, entry.name), path + "/"));
    else if (path !== "sw.js") result.push(path);
  }
  return result.sort();
}
const paths = await files("dist");
const hash = createHash("sha256");
for (const path of paths) hash.update(await readFile(join("dist", path)));
const version = hash.digest("hex").slice(0, 16);
const code = `/* Generated from the complete build; only this app's own files are cached. */
const CACHE = 'volleyball-king-${version}';
const FILES = ${JSON.stringify(paths)};
const ROOT = new URL('./', self.location).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(path => new URL(path, ROOT).href))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('volleyball-king-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(ROOT)) return;
  const path = url.pathname.slice(new URL(ROOT).pathname.length);
  const target = event.request.mode === 'navigate' ? new URL('index.html', ROOT).href : event.request;
  if (event.request.mode !== 'navigate' && !FILES.includes(path)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.status >= 500) {
        const cached = await cache.match(target);
        if (cached) return cached;
      }
      if (response.ok) await cache.put(target, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(target);
      if (cached) return cached;
      throw error;
    }
  })());
});
`;
await writeFile("dist/sw.js", code);
console.log(`PWA: ${paths.length} app files, cache ${version}`);
